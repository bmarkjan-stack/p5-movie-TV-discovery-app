import { Link } from "react-router-dom";

import { IMAGE_BASE_URL } from "../services/movieApi";
import { useFavorites } from "../context/useFavorites";
import {
    getDisplayTitle,
    getReleaseDate,
    type MediaItem,
} from "../types/movie";

interface MovieCardProps {
    item: MediaItem;
}

export default function MovieCard({ item }: MovieCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();

    const title = getDisplayTitle(item);
    const favorite = isFavorite(item.media_type, item.id);
    const detailsPath = `/${item.media_type}/${item.id}`;

    const posterUrl = item.poster_path
        ? `${IMAGE_BASE_URL}${item.poster_path}`
        : "/placeholder-poster.svg";

    const releaseDate = getReleaseDate(item);
    const releaseYear = releaseDate ? releaseDate.substring(0, 4) : "Unknown";

    return (
        <article className="movie-card">
            <div className="movie-poster-container">
                <Link to={detailsPath} aria-label={`View details for ${title}`}>
                    <img
                        className="movie-poster"
                        src={posterUrl}
                        alt={item.poster_path ? `${title} poster` : `${title} (no poster available)`}
                        loading="lazy"
                    />
                </Link>

                <span className="media-badge">
                    {item.media_type === "tv" ? "TV" : "Movie"}
                </span>

                <button
                    type="button"
                    className={
                        favorite
                            ? "favorite-button favorite-active"
                            : "favorite-button"
                    }
                    onClick={() => toggleFavorite(item)}
                    aria-pressed={favorite}
                    aria-label={
                        favorite
                            ? `Remove ${title} from favorites`
                            : `Add ${title} to favorites`
                    }
                >
                    <span aria-hidden="true">{favorite ? "♥" : "♡"}</span>
                </button>
            </div>

            <div className="movie-card-content">
                <Link to={detailsPath} className="movie-title">
                    {title}
                </Link>

                <div className="movie-meta">
                    <span
                        className="rating"
                        aria-label={`Rated ${item.vote_average.toFixed(1)} out of 10`}
                    >
                        ★ {item.vote_average.toFixed(1)}
                    </span>
                    <span>{releaseYear}</span>
                </div>
            </div>
        </article>
    );
}
