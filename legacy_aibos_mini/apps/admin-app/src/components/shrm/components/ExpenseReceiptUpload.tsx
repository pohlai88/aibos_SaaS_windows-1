'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Eye, CheckCircle, AlertCircle, FileText, Image, Camera, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';

import { FILE_UPLOAD_LIMITS } from '../constants/expense';
import type { ExpenseReceipt } from '../types/expense';

interface ExpenseReceiptUploadProps {
  expenseItemId: string;
  employeeId: string;
  onUpload: (receipt: ExpenseReceipt) => Promise<void>;
  onValidation: (receipt: ExpenseReceipt) => Promise<boolean>;
  onOCRProcess: (receipt: ExpenseReceipt) => Promise<Partial<ExpenseReceipt>>;
  existingReceipt?: ExpenseReceipt;
  disabled?: boolean;
}

export const ExpenseReceiptUpload: React.FC<ExpenseReceiptUploadProps> = ({
  expenseItemId,
  employeeId,
  onUpload,
  onValidation,
  onOCRProcess,
  existingReceipt,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file
    if (file.size > FILE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    if (!FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image or PDF.');
      return;
    }

    setUploadedFile(file);
    setValidationErrors([]);
    setIsValid(false);
    setIsManuallyVerified(false);
    setOcrData(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload file
    setIsUploading(true);
    try {
      const receipt: ExpenseReceipt = {
        id: '',
        expense_item_id: expenseItemId,
        employee_id: employeeId,
        file_name: file.name,
        file_path: '',
        file_size: file.size,
        file_type: file.name.split('.').pop() || '',
        mime_type: file.type,
        ocr_processed: false,
        is_valid: true,
        validation_errors: [],
        manually_verified: false,
        upload_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await onUpload(receipt);
      toast.success('Receipt uploaded successfully');

      // Process OCR
      setIsProcessing(true);
      try {
        const processedData = await onOCRProcess(receipt);
        setOcrData(processedData.extracted_data);
        if (processedData.extracted_data) {
          toast.success('OCR processing completed');
        }
      } catch (error) {
        console.error('OCR processing error:', error);
        toast.error('OCR processing failed');
      } finally {
        setIsProcessing(false);
      }

      // Validate receipt
      setIsValidating(true);
      try {
        const isValidReceipt = await onValidation(receipt);
        setIsValid(isValidReceipt);
        if (!isValidReceipt) {
          setValidationErrors(['Receipt validation failed']);
        }
      } catch (error) {
        console.error('Validation error:', error);
        setValidationErrors(['Validation failed']);
      } finally {
        setIsValidating(false);
      }

    } catch (error) {
      toast.error('Failed to upload receipt');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [expenseItemId, employeeId, onUpload, onValidation, onOCRProcess]);

  // Handle file input change
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle camera capture
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('Camera error:', error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraRef.current?.srcObject) {
      const stream = cameraRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (cameraRef.current && canvasRef.current) {
      const video = cameraRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFileSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  }, [handleFileSelect, stopCamera]);

  // Handle manual verification
  const handleManualVerification = useCallback(() => {
    setIsManuallyVerified(true);
    setIsValid(true);
    setValidationErrors([]);
    toast.success('Receipt manually verified');
  }, []);

  // Clear uploaded file
  const clearFile = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setValidationErrors([]);
    setIsValid(false);
    setIsManuallyVerified(false);
    setOcrData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!uploadedFile && !existingReceipt && (
        <Card className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              disabled
                ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Receipt
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your receipt here, or click to browse
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_UPLOAD_LIMITS.ALLOWED_MIME_TYPES.join(',')}
                onChange={handleFileInputChange}
                disabled={disabled}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Browse Files</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                disabled={disabled}
                className="flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Supported formats: JPG, PNG, GIF, PDF</p>
              <p>Maximum size: {FILE_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB</p>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      {(isUploading || isProcessing || isValidating) && (
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isUploading && 'Uploading receipt...'}
                {isProcessing && 'Processing OCR...'}
                {isValidating && 'Validating receipt...'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we process your receipt
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Uploaded File */}
      {(uploadedFile || existingReceipt) && (
        <Card className="p-4">
          <div className="flex items-start space-x-4">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {uploadedFile?.type.startsWith('image/') || existingReceipt?.mime_type.startsWith('image/') ? (
                <Image className="w-8 h-8 text-blue-600" />
              ) : (
                <FileText className="w-8 h-8 text-gray-600" />
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {uploadedFile?.name || existingReceipt?.file_name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(uploadedFile?.size || existingReceipt?.file_size || 0)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    color={isValid ? 'green' : validationErrors.length > 0 ? 'red' : 'yellow'}
                  >
                    {isValid ? 'Valid' : validationErrors.length > 0 ? 'Invalid' : 'Pending'}
                  </Badge>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {!isManuallyVerified && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleManualVerification}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* OCR Data */}
              {ocrData && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Extracted Data
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {ocrData.vendor_name && (
                      <div>
                        <span className="font-medium">Vendor:</span> {ocrData.vendor_name}
                      </div>
                    )}
                    {ocrData.amount && (
                      <div>
                        <span className="font-medium">Amount:</span> {ocrData.amount}
                      </div>
                    )}
                    {ocrData.date && (
                      <div>
                        <span className="font-medium">Date:</span> {ocrData.date}
                      </div>
                    )}
                    {ocrData.tax_amount && (
                      <div>
                        <span className="font-medium">Tax:</span> {ocrData.tax_amount}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Receipt Preview"
      >
        <div className="max-h-96 overflow-auto">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="w-full h-auto"
            />
          )}
        </div>
      </Modal>

      {/* Camera Modal */}
      <Modal
        isOpen={showCamera}
        onClose={stopCamera}
        title="Take Photo"
      >
        <div className="space-y-4">
          <video
            ref={cameraRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={stopCamera}
            >
              Cancel
            </Button>
            <Button
              onClick={capturePhoto}
              className="flex items-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Capture</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 