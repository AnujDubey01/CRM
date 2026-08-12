function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div>
        <h3 className="error-state__title">Unable to load dashboard data.</h3>
        <p className="error-state__description">{message}</p>
      </div>
      <button type="button" className="error-state__button" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

export default ErrorState
