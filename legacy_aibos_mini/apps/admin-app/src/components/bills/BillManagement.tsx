'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  BillService,
  Bill,
  BillStatus,
  BillPayment,
  Vendor,
  BillFilter,
  BillSummary
} from '@aibos/ledger-sdk';

interface BillManagementProps {
  organizationId: string;
}

export default function BillManagement({ organizationId }: BillManagementProps) {
  const [activeTab, setActiveTab] = useState<'bills' | 'vendors' | 'payments'>('bills');
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<BillSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBills, setTotalBills] = useState(0);

  // Modal states
  const [createBillModalOpen, setCreateBillModalOpen] = useState(false);
  const [createVendorModalOpen, setCreateVendorModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Form states
  const [billForm, setBillForm] = useState({
    vendorId: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference: '',
    notes: '',
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    currency: 'USD',
    terms: '',
    paymentTerms: 'Net 30',
    lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, accountId: '' }]
  });

  const [vendorForm, setVendorForm] = useState({
    vendorCode: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    taxId: '',
    paymentTerms: 'Net 30',
    creditLimit: 0
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    amount: 0,
    currency: 'USD',
    notes: ''
  });

  // Filter states
  const [filters, setFilters] = useState<BillFilter>({});

  const billService = new BillService(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bills') {
        const { bills: billsData, total, error } = await billService.getBills(
          organizationId,
          filters,
          currentPage,
          20
        );
        if (error) throw error;
        
        setBills(billsData);
        setTotalBills(total);
        setTotalPages(Math.ceil(total / 20));

        // Load summary
        const { summary: summaryData } = await billService.getBillSummary(organizationId);
        setSummary(summaryData);
      } else if (activeTab === 'vendors') {
        const { vendors: vendorsData } = await billService.getVendors(organizationId);
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBill = async () => {
    setLoading(true);
    try {
      const { bill, error } = await billService.createBill(organizationId, {
        ...billForm,
        vendorId: billForm.vendorId,
        billDate: billForm.billDate,
        dueDate: billForm.dueDate,
        reference: billForm.reference,
        notes: billForm.notes,
        subtotal: billForm.subtotal,
        taxAmount: billForm.taxAmount,
        totalAmount: billForm.totalAmount,
        currency: billForm.currency,
        terms: billForm.terms,
        paymentTerms: billForm.paymentTerms,
        lines: billForm.lines.map((line, index) => ({
          ...line,
          accountId: line.accountId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.quantity * line.unitPrice * (line.taxRate / 100),
          totalAmount: line.quantity * line.unitPrice * (1 + line.taxRate / 100),
          lineNumber: index + 1
        }))
      });

      if (error) throw error;

      setCreateBillModalOpen(false);
      resetBillForm();
      loadData();
    } catch (error) {
      console.error('Error creating bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async () => {
    setLoading(true);
    try {
      const { vendor, error } = await billService.createVendor(organizationId, vendorForm);
      if (error) throw error;

      setCreateVendorModalOpen(false);
      resetVendorForm();
      loadData();
    } catch (error) {
      console.error('Error creating vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async () => {
    if (!selectedBill) return;

    setLoading(true);
    try {
      const { payment, error } = await billService.recordBillPayment(selectedBill.id, {
        ...paymentForm,
        billId: selectedBill.id,
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        amount: paymentForm.amount,
        currency: paymentForm.currency,
        notes: paymentForm.notes,
        userId: 'current-user-id' // Would come from auth context
      });

      if (error) throw error;

      setPaymentModalOpen(false);
      resetPaymentForm();
      loadData();
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBillStatus = async (billId: string, status: BillStatus) => {
    setLoading(true);
    try {
      const { success, error } = await billService.updateBillStatus(
        billId,
        status,
        'current-user-id' // Would come from auth context
      );

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating bill status:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetBillForm = () => {
    setBillForm({
      vendorId: '',
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reference: '',
      notes: '',
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      currency: 'USD',
      terms: '',
      paymentTerms: 'Net 30',
      lines: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, accountId: '' }]
    });
  };

  const resetVendorForm = () => {
    setVendorForm({
      vendorCode: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      taxId: '',
      paymentTerms: 'Net 30',
      creditLimit: 0
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      reference: '',
      amount: 0,
      currency: 'USD',
      notes: ''
    });
  };

  const getStatusBadgeVariant = (status: BillStatus) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'default';
      case 'approved': return 'default';
      case 'partially_paid': return 'default';
      case 'paid': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderBillsTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold">{summary.totalBills}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">${summary.totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">${summary.paidAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">${summary.outstandingAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${summary.overdueAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Avg Bill</p>
              <p className="text-2xl font-bold">${(summary.totalAmount / summary.totalBills || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as BillStatus || undefined })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date To</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                placeholder="Bill number, reference..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bills</CardTitle>
          <Button onClick={() => setCreateBillModalOpen(true)}>
            Create Bill
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="font-mono">{bill.billNumber}</td>
                    <td>{bill.vendor?.name}</td>
                    <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="text-right">${bill.totalAmount.toLocaleString()}</td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(bill.status)}>
                        {bill.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentForm({ ...paymentForm, amount: bill.totalAmount });
                            setPaymentModalOpen(true);
                          }}
                        >
                          Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateBillStatus(bill.id, 'approved')}
                        >
                          Approve
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalBills)} of {totalBills} bills
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVendorsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendors</CardTitle>
          <Button onClick={() => setCreateVendorModalOpen(true)}>
            Add Vendor
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Vendor Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="font-mono">{vendor.vendorCode}</td>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.paymentTerms}</td>
                    <td>
                      <Badge variant={vendor.isActive ? 'default' : 'secondary'}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Bill Management</h2>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'bills', label: 'Bills' },
            { id: 'vendors', label: 'Vendors' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'bills' && renderBillsTab()}
        {activeTab === 'vendors' && renderVendorsTab()}
      </div>

      {/* Create Bill Modal */}
      <Modal
        isOpen={createBillModalOpen}
        onClose={() => setCreateBillModalOpen(false)}
        title="Create Bill"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <select
                value={billForm.vendorId}
                onChange={(e) => setBillForm({ ...billForm, vendorId: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bill Date</label>
              <Input
                type="date"
                value={billForm.billDate}
                onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <Input
                type="date"
                value={billForm.dueDate}
                onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <Input
                value={billForm.reference}
                onChange={(e) => setBillForm({ ...billForm, reference: e.target.value })}
                placeholder="PO number, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={billForm.notes}
              onChange={(e) => setBillForm({ ...billForm, notes: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateBillModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBill} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Create Bill'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Vendor Modal */}
      <Modal
        isOpen={createVendorModalOpen}
        onClose={() => setCreateVendorModalOpen(false)}
        title="Add Vendor"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Code</label>
              <Input
                value={vendorForm.vendorCode}
                onChange={(e) => setVendorForm({ ...vendorForm, vendorCode: e.target.value })}
                placeholder="VEND-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                placeholder="Vendor Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                placeholder="vendor@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input
                value={vendorForm.city}
                onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input
                value={vendorForm.state}
                onChange={(e) => setVendorForm({ ...vendorForm, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code</label>
              <Input
                value={vendorForm.postalCode}
                onChange={(e) => setVendorForm({ ...vendorForm, postalCode: e.target.value })}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateVendorModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createVendor} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Add Vendor'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Payment"
      >
        <div className="space-y-4">
          {selectedBill && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Bill: {selectedBill.billNumber}</p>
              <p className="text-sm text-gray-600">Vendor: {selectedBill.vendor?.name}</p>
              <p className="text-sm text-gray-600">Amount Due: ${selectedBill.totalAmount.toLocaleString()}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Date</label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <Input
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                placeholder="Check number, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Payment notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={recordPayment} disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Record Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 