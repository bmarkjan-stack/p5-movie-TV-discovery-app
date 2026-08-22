import { Link } from "react-router-dom";

import { IMAGE_BASE_URL } from "../services/movieApi";
import { useFavorites } from "../context/useFavorites";
import type { Movie } from "../types/movie";

interface MovieCardProps {
    movie: Movie;
}

export default function MovieCard({
    movie,
}: MovieCardProps) {
    const {
    isFavorite,
    toggleFavorite,
    } = useFavorites();

    const favorite = isFavorite(movie.id);

    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "/placeholder-poster.svg";

    const releaseYear = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "Unknown";

    return (
        <article className="movie-card">
            <div className="movie-poster-container">
                <Link to={`/movie/${movie.id}`}>
                    <img
                        className="movie-poster"
                        src={posterUrl}
                        alt={`${movie.title} poster`}
                        loading="lazy"
                    />
                </Link>

                <button
                    className={
                        favorite
                            ? "favorite-button favorite-active"
                            : "favorite-button"
                    }
                    onClick={() => toggleFavorite(movie)}
                    aria-label={
                        favorite
                            ? `Remove ${movie.title} from favorites`
                            : `Add ${movie.title} to favorites`
                    }
                >
                    {favorite ? "♥" : "♡"}
                </button>
            </div>

            <div className="movie-card-content">
                <Link 
                    to={`/movie/${movie.id}`}
                    className="movie-title"
                >
                    {movie.title}
                </Link>

                <div className="movie-meta">
                    <span className="rating">
                        ★ {movie.vote_average.toFixed(1)}
                    </span>
                    <span>{releaseYear}</span>
                </div>
            </div>
        </article>
    );
}