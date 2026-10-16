interface LoadingSpinnerProps {
    label?: string;
}

export default function LoadingSpinner({
    label = "Loading...",
}: LoadingSpinnerProps) {
    return (
        <div className="loading-container" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true" />
            <p>{label}</p>
        </div>
    );
}
