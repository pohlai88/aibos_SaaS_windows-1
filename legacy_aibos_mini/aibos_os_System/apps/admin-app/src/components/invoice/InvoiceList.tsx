'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Send,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { AppleStyleTable } from '../ui/AppleStyleTable'
import { LuxuryModal } from '../ui/LuxuryModal'
import { LuxuryDropdown } from '../ui/LuxuryDropdown'
import { GlassPanel } from '../ui/GlassPanel'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  customer_name: string
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  currency: string
}

interface InvoiceListProps {
  organizationId: string
}

export function InvoiceList({ organizationId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  // Sample data for demonstration
  useEffect(() => {
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        invoice_number: 'INV-2024-001',
        invoice_date: '2024-01-15',
        due_date: '2024-02-15',
        customer_name: 'Acme Corporation',
        total: 2500.00,
        status: 'sent',
        currency: 'USD'
      },
      {
        id: '2',
        invoice_number: 'INV-2024-002',
        invoice_date: '2024-01-20',
        due_date: '2024-02-20',
        customer_name: 'TechStart Inc',
        total: 1500.00,
        status: 'paid',
        currency: 'USD'
      },
      {
        id: '3',
        invoice_number: 'INV-2024-003',
        invoice_date: '2024-01-25',
        due_date: '2024-02-25',
        customer_name: 'Global Solutions',
        total: 3500.00,
        status: 'overdue',
        currency: 'USD'
      },
      {
        id: '4',
        invoice_number: 'INV-2024-004',
        invoice_date: '2024-01-30',
        due_date: '2024-02-30',
        customer_name: 'Innovation Labs',
        total: 1800.00,
        status: 'draft',
        currency: 'USD'
      }
    ]

    setInvoices(sampleInvoices)
    setLoading(false)
  }, [])

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const tableColumns = [
    { 
      key: 'invoice_number', 
      label: 'Invoice #', 
      sortable: true,
      formatter: (value: string) => (
        <span className="font-mono text-sm font-medium text-neon-blue">
          {value}
        </span>
      )
    },
    { 
      key: 'customer_name', 
      label: 'Customer', 
      sortable: true,
      formatter: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'invoice_date', 
      label: 'Date', 
      sortable: true,
      formatter: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    },
    { 
      key: 'due_date', 
      label: 'Due Date', 
      sortable: true,
      formatter: (value: string) => (
        <span className={`
          ${new Date(value) < new Date() ? 'text-red-400' : 'text-muted-foreground'}
        `}>
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: 'total', 
      label: 'Amount', 
      sortable: true,
      formatter: (value: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      formatter: (value: string) => (
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${value === 'paid' ? 'bg-green-500/20 text-green-400' : ''}
          ${value === 'sent' ? 'bg-blue-500/20 text-blue-400' : ''}
          ${value === 'draft' ? 'bg-gray-500/20 text-gray-400' : ''}
          ${value === 'overdue' ? 'bg-red-500/20 text-red-400' : ''}
          ${value === 'void' ? 'bg-orange-500/20 text-orange-400' : ''}
        `}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      formatter: (value: any, row: Invoice) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedInvoice(row)
              setShowInvoiceModal(true)
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="View Invoice"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          <LuxuryDropdown
            trigger={
              <button className="p-1 hover:bg-white/10 rounded transition-colors">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </button>
            }
            items={[
              {
                label: 'Edit Invoice',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => console.log('Edit invoice', row.id)
              },
              {
                label: 'Send Invoice',
                icon: <Send className="h-4 w-4" />,
                onClick: () => console.log('Send invoice', row.id),
                disabled: row.status !== 'draft'
              },
              {
                label: 'Record Payment',
                icon: <DollarSign className="h-4 w-4" />,
                onClick: () => console.log('Record payment', row.id),
                disabled: row.status === 'paid'
              },
              {
                label: 'Download PDF',
                icon: <Download className="h-4 w-4" />,
                onClick: () => console.log('Download PDF', row.id)
              },
              {
                label: 'Void Invoice',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => console.log('Void invoice', row.id),
                disabled: row.status === 'paid',
                className: 'text-red-400'
              }
            ]}
          />
        </div>
      )
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'void', label: 'Void' }
  ]

  const summaryStats = {
    total: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    outstandingAmount: invoices
      .filter(inv => ['sent', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.total, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-muted-foreground">Manage your customer invoices</p>
        </div>
        <button className="btn-apple-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassPanel className="p-4">
          <div className="text-sm text-muted-foreground">Total Invoices</div>
          <div className="text-2xl font-bold text-white">{summaryStats.total}</div>
        </GlassPanel>
        <GlassPanel className="p-4">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="text-2xl font-bold text-neon-green">
            ${summaryStats.totalAmount.toLocaleString()}
          </div>
        </GlassPanel>
        <GlassPanel className="p-4">
          <div className="text-sm text-muted-foreground">Outstanding</div>
          <div className="text-2xl font-bold text-neon-orange">
            ${summaryStats.outstandingAmount.toLocaleString()}
          </div>
        </GlassPanel>
        <GlassPanel className="p-4">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold text-red-400">
            {summaryStats.overdue}
          </div>
        </GlassPanel>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-apple text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all duration-200 ease-apple-smooth"
          />
        </div>
        <LuxuryDropdown
          trigger={
            <button className="btn-apple-secondary inline-flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {statusOptions.find(opt => opt.value === statusFilter)?.label || 'All Statuses'}
            </button>
          }
          items={statusOptions.map(option => ({
            label: option.label,
            onClick: () => setStatusFilter(option.value)
          }))}
        />
      </div>

      {/* Invoice Table */}
      <AppleStyleTable
        columns={tableColumns}
        data={filteredInvoices}
        searchable={false}
        className="animate-apple-fade"
        loading={loading}
      />

      {/* Invoice Detail Modal */}
      <LuxuryModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={`Invoice ${selectedInvoice?.invoice_number}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Customer</label>
                <div className="font-medium">{selectedInvoice.customer_name}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Invoice Date</label>
                <div className="font-medium">
                  {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Due Date</label>
                <div className="font-medium">
                  {new Date(selectedInvoice.due_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <div className="font-medium capitalize">{selectedInvoice.status}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Amount</label>
                <div className="font-medium text-lg">
                  ${selectedInvoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Currency</label>
                <div className="font-medium">{selectedInvoice.currency}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <button className="btn-apple-primary">Edit Invoice</button>
              <button className="btn-apple-secondary">Send Invoice</button>
              <button className="btn-apple-secondary">Download PDF</button>
            </div>
          </div>
        )}
      </LuxuryModal>
    </div>
  )
} 