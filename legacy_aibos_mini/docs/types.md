interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface AibosUITableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  searchable?: boolean
  className?: string
}