export default function SkeletonCard() {
    return (
        <div className="movie-card skeleton-card" aria-hidden="true">
            <div className="skeleton skeleton-poster" />
            <div className="movie-card-content">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-line-short" />
            </div>
        </div>
    );
}
