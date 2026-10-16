interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="error-message" role="alert">
            <div className="error-icon" aria-hidden="true">!</div>
            <h2>Something went wrong</h2>
            <p>{message}</p>
            {onRetry && (
                <button type="button" className="primary-button" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
