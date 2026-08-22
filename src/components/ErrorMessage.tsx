interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorMessage({
    message,
    onRetry,
}: ErrorMessageProps) {
    return (
        <div className="error-message">
            <div className="error-icon">!</div>
            <h2>Something went wrong</h2>
            <p>{message}</p>
            {onRetry && (
                <button
                    className="primary-button"
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}