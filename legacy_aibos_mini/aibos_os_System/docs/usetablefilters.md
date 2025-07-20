// Enhanced accessibility
<table 
  className="w-full" 
  role="table"
  aria-label="Data table with sorting and filtering"
>
  <TableHeader 
    columns={columns}
    sortConfig={sortConfig}
    onSort={handleSort}
    aria-label="Table headers with sorting controls"
  />
  <TableBody 
    columns={columns}
    data={sortedAndFilteredData}
    loading={loading}
    aria-live="polite"
    aria-busy={loading}
  />
</table>