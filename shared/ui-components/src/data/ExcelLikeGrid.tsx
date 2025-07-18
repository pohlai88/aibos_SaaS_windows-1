import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Input } from '../primitives/Input';
import { Copy, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
// Cell data interface
interface CellData {
 value: string | number;
 formula?: string;
 format?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
 style?: {
 bold?: boolean;
 italic?: boolean;
 color?: string;
 backgroundColor?: string;
 };
 validation?: {
 type: 'text' | 'number' | 'email' | 'custom';
 rule?: string;
 message?: string;
 };
}
// Grid data structure
interface GridData {
 [rowIndex: number]: {
 [colIndex: number]: CellData;
 };
}
// Selection range
interface SelectionRange {
 startRow: number;
 startCol: number;
 endRow: number;
 endCol: number;
}
// Excel-like grid component
export interface ExcelLikeGridProps extends VariantProps<typeof gridVariants> {
 data: GridData;
 columns: Array<{
 key: string;
 header: string;
 width?: number;
 type?: 'text' | 'number' | 'formula';
 editable?: boolean;
 format?: string;
 }>;
 rows?: number;
 className?: string;
 onDataChange?: (data: GridData) => void;
 enableFormulas?: boolean;
 enableFormatting?: boolean;
 enableValidation?: boolean;
 enableCopyPaste?: boolean;
 enableKeyboardNav?: boolean;
}
const gridVariants = cva('w-full border border-border rounded-lg overflow-hidden', {;
 variants: {
 variant: {
 default: 'bg-background',
 striped: 'bg-background',
 bordered: 'bg-background'
 },
 size: {
 sm: 'text-sm',
 md: 'text-base',
 lg: 'text-lg'
 }
 },
 defaultVariants: {
 variant: 'default',
 size: 'md'
 }
});
export const ExcelLikeGrid: React.FC<ExcelLikeGridProps> = ({
 data,
 columns,
 rows = 1000,
 className,
 onDataChange,
 enableFormulas = true,
 enableFormatting = true,
 enableValidation = true,
 enableCopyPaste = true,
 enableKeyboardNav = true,
 variant = 'default',
 size = 'md'
}) => {
 const [gridData, setGridData] = useState<GridData>(data);
 const [selection, setSelection] = useState<SelectionRange | null>(null);
 const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
 const [clipboard, setClipboard] = useState<string[][]>([]);
 const [copyMode, setCopyMode] = useState<'copy' | 'cut'>('copy');
 const [showFormulaBar, setShowFormulaBar] = useState<boolean>(false);
 const [formulaInput, setFormulaInput] = useState<string>('');
 const gridRef = useRef<HTMLDivElement>(null);
 const editingRef = useRef<HTMLInputElement>(null);
 // Virtualization for large datasets
 const rowVirtualizer = useVirtualizer({;
 count: rows,
 getScrollElement: () => gridRef.current,
 estimateSize: () => 35, // Row height
 overscan: 10
 });
 // Formula parser (simplified)
 const parseFormula = useCallback(;
 (formula: string, row: number, col: number): string => {
 if (!formula.startsWith('=')) return formula;
 try {
 // Basic formula support
 const cleanFormula = formula.substring(1).toUpperCase();
 // SUM function
 if (cleanFormula.startsWith('SUM(')) {
 const range = cleanFormula.match(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/);
 if (range) {
 const [start, end] = range.slice(1);
 const startCol = columnToIndex(start.match(/[A-Z]+/)[0]);
 const startRow = parseInt(start.match(/\d+/)[0]) - 1;
 const endCol = columnToIndex(end.match(/[A-Z]+/)[0]);
 const endRow = parseInt(end.match(/\d+/)[0]) - 1;
 let sum = 0;
 for (let r = startRow; r <= endRow; r++) {
 for (let c = startCol; c <= endCol; c++) {
 const cell = gridData[r]?.[c];
 if (cell && typeof cell.value === 'number') {
 sum += cell.value;
 }
 }
 }
 return sum.toString();
 }
 }
 // AVERAGE function
 if (cleanFormula.startsWith('AVERAGE(')) {
 const range = cleanFormula.match(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/);
 if (range) {
 const [start, end] = range.slice(1);
 const startCol = columnToIndex(start.match(/[A-Z]+/)[0]);
 const startRow = parseInt(start.match(/\d+/)[0]) - 1;
 const endCol = columnToIndex(end.match(/[A-Z]+/)[0]);
 const endRow = parseInt(end.match(/\d+/)[0]) - 1;
 let sum = 0;
 let count = 0;
 for (let r = startRow; r <= endRow; r++) {
 for (let c = startCol; c <= endCol; c++) {
 const cell = gridData[r]?.[c];
 if (cell && typeof cell.value === 'number') {
 sum += cell.value;
 count++;
 }
 }
 }
 return count > 0 ? (sum / count).toString() : '0';
 }
 }
 // Cell reference
 const cellRef = cleanFormula.match(/^[A-Z]+\d+$/);
 if (cellRef) {
 const col = columnToIndex(cellRef[0].match(/[A-Z]+/)[0]);
 const row = parseInt(cellRef[0].match(/\d+/)[0]) - 1;
 const cell = gridData[row]?.[col];
 return cell ? cell.value.toString() : '';
 }
 return '#ERROR';
 } catch (error) {
 return '#ERROR';
 }
 },
 [gridData],
 );
 // Convert column letter to index
 const columnToIndex = (col: string): number => {;
 let result = 0;
 for (let i = 0; i < col.length; i++) {
 result = result * 26 + col.charCodeAt(i) - 64;
 }
 return result - 1;
 };
 // Convert index to column letter
 const indexToColumn = (index: number): string => {;
 let result = '';
 while (index >= 0) {
 result = String.fromCharCode(65 + (index % 26)) + result;
 index = Math.floor(index / 26) - 1;
 }
 return result;
 };
 // Get cell value (with formula evaluation)
 const getCellValue = useCallback(;
 (row: number, col: number): string => {
 const cell = gridData[row]?.[col];
 if (!cell) return '';
 if (cell.formula && enableFormulas) {
 return parseFormula(cell.formula, row, col);
 }
 return cell.value.toString();
 },
 [gridData, enableFormulas, parseFormula],
 );
 // Update cell data
 const updateCell = useCallback(;
 (row: number, col: number, value: string, formula?: string) => {
 setGridData((prev) => {
 const newData = { ...prev };
 if (!newData[row]) newData[row] = {};
 newData[row][col] = {
 value: formula ? value : isNaN(Number(value)) ? value : Number(value),
 formula,
 format: (columns[col]?.format as unknown) || 'text'
 };
 return newData;
 });
 onDataChange?.(gridData);
 },
 [columns, onDataChange, gridData],
 );
 // Handle cell click
 const handleCellClick = useCallback(;
 (row: number, col: number) => {
 setSelection({ startRow: row, startCol: col, endRow: row, endCol: col });
 setEditingCell({ row, col });
 const cell = gridData[row]?.[col];
 setFormulaInput(cell?.formula || getCellValue(row, col));
 setShowFormulaBar(true);
 },
 [gridData, getCellValue],
 );
 // Handle cell double click for inline editing
 const handleCellDoubleClick = useCallback(;
 (row: number, col: number) => {
 setEditingCell({ row, col });
 setFormulaInput(gridData[row]?.[col]?.formula || getCellValue(row, col));
 },
 [gridData, getCellValue],
 );
 // Handle keyboard navigation
 const handleKeyDown = useCallback(;
 (e: React.KeyboardEvent, row: number, col: number) => {
 if (!enableKeyboardNav) return;
 switch (e.key) {
 case 'Tab':
 e.preventDefault();
 if (e.shiftKey) {
 // Previous cell
 if (col > 0) {
 handleCellClick(row, col - 1);
 } else if (row > 0) {
 handleCellClick(row - 1, columns.length - 1);
 }
 } else {
 // Next cell
 if (col < columns.length - 1) {
 handleCellClick(row, col + 1);
 } else if (row < rows - 1) {
 handleCellClick(row + 1, 0);
 }
 }
 break;
 case 'Enter':
 e.preventDefault();
 if (e.shiftKey) {
 // Previous row
 if (row > 0) {
 handleCellClick(row - 1, col);
 }
 } else {
 // Next row
 if (row < rows - 1) {
 handleCellClick(row + 1, col);
 }
 }
 break;
 case 'Escape':
 setEditingCell(null);
 setShowFormulaBar(false);
 break;
 case 'F2':
 e.preventDefault();
 handleCellDoubleClick(row, col);
 break;
 case 'c':
 if (e.ctrlKey || e.metaKey) {
 e.preventDefault();
 copySelection();
 }
 break;
 case 'v':
 if (e.ctrlKey || e.metaKey) {
 e.preventDefault();
 pasteSelection();
 }
 break;
 case 'x':
 if (e.ctrlKey || e.metaKey) {
 e.preventDefault();
 cutSelection();
 }
 break;
 }
 },
 [enableKeyboardNav, columns.length, rows, copySelection, pasteSelection, cutSelection],
 );
 // Copy selection
 const copySelection = useCallback(() => {;
 if (!selection || !enableCopyPaste) return;
 const { startRow, startCol, endRow, endCol } = selection;
 const copiedData: string[][] = [];
 for (let row = startRow; row <= endRow; row++) {
 const rowData: string[] = [];
 for (let col = startCol; col <= endCol; col++) {
 rowData.push(getCellValue(row, col));
 }
 copiedData.push(rowData);
 }
 setClipboard(copiedData);
 setCopyMode('copy');
 // Copy to system clipboard
 const _textData = copiedData.map((row) => row.join('\t')).join('\n');
 navigator.clipboard.writeText(textData);
 }, [selection, enableCopyPaste, getCellValue]);
 // Cut selection
 const cutSelection = useCallback(() => {;
 copySelection();
 setCopyMode('cut');
 }, [copySelection]);
 // Paste selection
 const pasteSelection = useCallback(() => {;
 if (!selection || !enableCopyPaste || clipboard.length === 0) return;
 const { startRow, startCol } = selection;
 const newData = { ...gridData };
 clipboard.forEach((rowData, rowOffset) => {
 const targetRow = startRow + rowOffset;
 if (targetRow >= rows) return;
 if (!newData[targetRow]) newData[targetRow] = {};
 rowData.forEach((cellValue, colOffset) => {
 const targetCol = startCol + colOffset;
 if (targetCol >= columns.length) return;
 newData[targetRow][targetCol] = {
 value: isNaN(Number(cellValue)) ? cellValue : Number(cellValue),
 format: (columns[targetCol]?.format as unknown) || 'text'
 };
 });
 });
 setGridData(newData);
 onDataChange?.(newData);
 if (copyMode === 'cut') {
 // Clear original selection
 const { startRow, startCol, endRow, endCol } = selection;
 for (let row = startRow; row <= endRow; row++) {
 for (let col = startCol; col <= endCol; col++) {
 if (newData[row]?.[col]) {
 delete newData[row][col];
 }
 }
 }
 setGridData(newData);
 }
 }, [selection, enableCopyPaste, clipboard, gridData, rows, columns, copyMode, onDataChange]);
 // Handle formula input
 const handleFormulaSubmit = useCallback(() => {;
 if (!editingCell) return;
 const { row, col } = editingCell;
 const _isFormula = formulaInput.startsWith('=');
 if (isFormula) {
 updateCell(row, col, formulaInput, formulaInput);
 } else {
 updateCell(row, col, formulaInput);
 }
 setEditingCell(null);
 setShowFormulaBar(false);
 }, [editingCell, formulaInput, updateCell]);
 // Render cell
 const _renderCell = useCallback(;
 (row: number, col: number) => {
 const _isSelected =;
 selection &&
 row >= selection.startRow &&
 row <= selection.endRow &&
 col >= selection.startCol &&
 col <= selection.endCol;
 const isEditing = editingCell && editingCell.row === row && editingCell.col === col;
 const cellValue = getCellValue(row, col);
 const cell = gridData[row]?.[col];
 return (;
 <div
 key={`${row}-${col}`}
 className={cn(
 'border-r border-b border-border p-2 min-h-[35px] flex items-center',
 'relative cursor-pointer select-none',
 isSelected && 'bg-primary/10 border-primary',
 isEditing && 'bg-blue-50 border-blue-500',
 variant === 'striped' && row % 2 === 0 && 'bg-muted/20',
 cell?.style?.bold && 'font-bold',
 cell?.style?.italic && 'italic',
 )}
 style={{
 width: columns[col]?.width || 150,
 color: cell?.style?.color,
 backgroundColor: cell?.style?.backgroundColor
 }}
 onClick={() => handleCellClick(row, col)}
 onDoubleClick={() => handleCellDoubleClick(row, col)}
 onKeyDown={(e) => handleKeyDown(e, row, col)}
 tabIndex={0}
 >
 {isEditing ? (
 <input
 ref={editingRef}
 type="text"
 value={formulaInput}
 onChange={(e) => setFormulaInput(e.target.value)}
 onBlur={handleFormulaSubmit}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleFormulaSubmit();
 }
 }}
 className="w-full h-full border-none outline-none bg-transparent"
 autoFocus
 />
 ) : (
 <span className="truncate">
 {cell?.format === 'currency' && typeof cellValue === 'number'
 ? `$${Number(cellValue).toFixed(2)}`
 : cell?.format === 'percentage' && typeof cellValue === 'number'
 ? `${Number(cellValue).toFixed(2)}%`
 : cellValue}
 </span>
 )}
 {cell?.formula && (
 <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
 )}
 </div>
 );
 },
 [
 selection,
 editingCell,
 getCellValue,
 gridData,
 columns,
 variant,
 handleCellClick,
 handleCellDoubleClick,
 handleKeyDown,
 formulaInput,
 handleFormulaSubmit
 ],
 );
 // Focus editing input when editing starts
 useEffect(() => {
 if (editingCell && editingRef.current) {
 editingRef.current.focus();
 editingRef.current.select();
 }
 }, [editingCell]);
 return (;
 <div className={cn(gridVariants({ variant, size }), className)}>
 {/* Formula bar */}
 <AnimatePresence>
 {showFormulaBar && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="border-b border-border p-2 bg-muted/20"
 >
 <div className="flex items-center gap-2">
 <span className="text-sm font-medium text-muted-foreground">
 {editingCell ? `${indexToColumn(editingCell.col)}${editingCell.row + 1}` : ''}
 </span>
 <input
 type="text"
 value={formulaInput}
 onChange={(e) => setFormulaInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleFormulaSubmit();
 }
 }}
 className="flex-1 px-2 py-1 border border-border rounded text-sm"
 placeholder="Enter value or formula (e.g., =SUM(A1:A10))"
 />
 <button
 onClick={handleFormulaSubmit}
 className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90"
 >
 ✓
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 {/* Grid header */}
 <div className="flex bg-muted/30 border-b border-border">
 <div className="w-12 border-r border-border bg-muted/50" />
 {columns.map((column, colIndex) => (
 <div
 key={column.key}
 className="p-2 font-medium text-sm border-r border-border last:border-r-0"
 style={{ width: column.width || 150 }}
 >
 {column.header}
 </div>
 ))}
 </div>
 {/* Grid content */}
 <div ref={gridRef} className="overflow-auto" style={{ height: '400px' }}>
 <div
 style={{
 height: `${rowVirtualizer.getTotalSize()}px`,
 width: '100%',
 position: 'relative'
 }}
 >
 {rowVirtualizer.getVirtualItems().map((virtualRow) => (
 <div
 key={virtualRow.index}
 className="flex"
 style={{
 height: `${virtualRow.size}px`,
 transform: `translateY(${virtualRow.start}px)`
 }}
 >
 {/* Row header */}
 <div className="w-12 border-r border-border bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
 {virtualRow.index + 1}
 </div>
 {/* Cells */}
 {columns.map((_, colIndex) => renderCell(virtualRow.index, colIndex))}
 </div>
 ))}
 </div>
 </div>
 {/* Status bar */}
 <div className="border-t border-border p-2 bg-muted/20 text-xs text-muted-foreground">
 <div className="flex items-center justify-between">
 <span>
 {selection
 ? `Selected: ${indexToColumn(selection.startCol)}${selection.startRow + 1}:${indexToColumn(selection.endCol)}${selection.endRow + 1}`
 : 'Ready'}
 </span>
 <span>
 {clipboard.length > 0 &&
 `Clipboard: ${clipboard.length} row${clipboard.length !== 1 ? 's' : ''}`}
 </span>
 </div>
 </div>
 </div>
 );
};
// Test component
export const ExcelLikeGridTest: React.FC = () => {
 const [testData, setTestData] = useState<GridData>({});
 // Generate test data
 useEffect(() => {
 const data: GridData = {};
 // Generate 1000 rows of sample data
 for (let row = 0; row < 1000; row++) {
 data[row] = {};
 for (let col = 0; col < 5; col++) {
 if (col === 0) {
 data[row][col] = { value: `Item ${row + 1}` };
 } else if (col === 1) {
 data[row][col] = { value: Math.floor(Math.random() * 1000), format: 'number' };
 } else if (col === 2) {
 data[row][col] = { value: Math.random() * 100, format: 'currency' };
 } else if (col === 3) {
 data[row][col] = { value: Math.random() * 100, format: 'percentage' };
 } else if (col === 4) {
 // Formula example
 data[row][col] = {
 value: 0,
 formula: `=SUM(B${row + 1}:D${row + 1})`,
 format: 'currency'
 };
 }
 }
 }
 setTestData(data);
 }, []);
 const columns = [;
 { key: 'name', header: 'Name', width: 200 },
 { key: 'quantity', header: 'Quantity', width: 100, type: 'number' },
 { key: 'price', header: 'Price', width: 120, format: 'currency' },
 { key: 'discount', header: 'Discount', width: 100, format: 'percentage' },
 { key: 'total', header: 'Total', width: 120, format: 'currency' }
 ];
 return (;
 <div className="p-6">
 <h2 className="text-2xl font-bold mb-4">Excel-Like Grid Test</h2>
 <p className="text-muted-foreground mb-4">
 Test Excel-like functionality with 1000 rows, formulas, copy-paste, and keyboard navigation.
 </p>
 <div className="mb-4 space-y-2">
 <h3 className="font-semibold">Features:</h3>
 <ul className="text-sm text-muted-foreground space-y-1">
 <li>• Click to select, double-click to edit</li>
 <li>• Tab/Enter for navigation, F2 for edit mode</li>
 <li>• Ctrl+C/V/X for copy/paste/cut</li>
 <li>• Formulas: =SUM(B1:D1), =AVERAGE(A1:A10)</li>
 <li>• Cell formatting: currency, percentage, text</li>
 </ul>
 </div>
 <ExcelLikeGrid
 data={testData}
 columns={columns}
 rows={1000}
 enableFormulas={true}
 enableFormatting={true}
 enableValidation={true}
 enableCopyPaste={true}
 enableKeyboardNav={true}
 onDataChange={setTestData}
 />
 </div>
 );
};