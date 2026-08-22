export default function LoadingSpinner() {
    return (
        <div className="loading-container">
            <div
                className="loading-spinner"
                aria-label="Loading"
            />
            <p>Loading movies...</p>
        </div>
    );
}