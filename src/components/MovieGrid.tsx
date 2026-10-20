import type { MediaItem } from "../types/movie";
import MovieCard from "./MovieCard";

interface MovieGridProps {
    items: MediaItem[];
    emptyTitle?: string;
}

export default function MovieGrid({
    items,
    emptyTitle = "Nothing found",
}: MovieGridProps) {
    if (items.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon" aria-hidden="true">🎬</div>
                <h2>{emptyTitle}</h2>
                <p>Try another search, or adjust your genre and filters.</p>
            </div>
        );
    }

    return (
        <div className="movie-grid">
            {items.map((item) => (
                <MovieCard key={`${item.media_type}-${item.id}`} item={item} />
            ))}
        </div>
    );
}
