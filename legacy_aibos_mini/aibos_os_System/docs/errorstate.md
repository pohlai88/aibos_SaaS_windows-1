// Enhanced error state with retry logic
export function ErrorState({ error, onRetry, className = '' }: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false)
  
  const handleRetry = async () => {
    if (!onRetry) return
    
    setRetrying(true)
    try {
      await onRetry()
    } catch (err) {
      // Handle retry failure
    } finally {
      setRetrying(false)
    }
  }
  
  return (
    <div className={`glass-card ${className}`} role="alert">
      {/* ... existing code ... */}
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="btn-apple-primary inline-flex items-center gap-2"
          aria-label="Retry failed operation"
        >
          <ArrowPathIcon className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  )
}