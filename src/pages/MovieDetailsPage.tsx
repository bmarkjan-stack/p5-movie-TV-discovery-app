import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";

import {
    BACKDROP_BASE_URL,
    IMAGE_BASE_URL,
    getMovieDetails,
} from "../services/movieApi";

import { useFavorites } from "../context/useFavorites";

import type { Movie } from "../types/movie";

export default function MovieDetailsPage() {
    const { movieId } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const {
        isFavorite,
        toggleFavorite,
    } = useFavorites();

    useEffect(() => {
        let cancelled = false;

        async function loadMovie() {
            if (!movieId) {
                if (!cancelled) {
                    setError("Movie ID was not provided.");
                    setLoading(false);
                }

                return;
            }

            try {
                const movieData =
                    await getMovieDetails(movieId);

                if (cancelled) {
                    return;
                }

                setMovie(movieData);
                setError(null);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load movie details."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadMovie();

        return () => {
            cancelled = true;
        };
    }, [movieId]);

    async function handleRetry() {
        if (!movieId) {
            setError("Movie ID was not provided.");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const movieData =
                await getMovieDetails(movieId);

            setMovie(movieData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load movie details."
            );
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="details-page">
                <LoadingSpinner />
            </main>
        );
    }

    if (error || !movie) {
        return (
            <main className="details-page">
                <ErrorMessage
                    message={
                        error ?? "Movie could not be found."
                    }
                    onRetry={handleRetry}
                />
            </main>
        );
    }

    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "/placeholder-poster.svg";

    const backdropUrl = movie.backdrop_path
        ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
        : undefined;

    const favorite = isFavorite(movie.id);

    return (
        <main className="details-page">
            <div
                className="details-backdrop"
                style={
                    backdropUrl
                        ? {
                            backgroundImage: `linear-gradient(
                                rgba(10, 10, 15, 0.25),
                                rgba(10, 10, 15, 0.98)
                            ), url(${backdropUrl})`,
                        }
                        : undefined
                }
            />

            <div className="details-container">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="details-content">
                    <div className="details-poster-container">
                        <img
                            src={posterUrl}
                            alt={`${movie.title} poster`}
                            className="details-poster"
                        />
                    </div>

                    <div className="details-information">
                        <p className="section-label">
                            MOVIE DETAILS
                        </p>

                        <h1>{movie.title}</h1>

                        {movie.tagline && (
                            <p className="tagline">
                                "{movie.tagline}"
                            </p>
                        )}

                        <div className="details-meta">
                            <span className="large-rating">
                                ★{" "}
                                {movie.vote_average.toFixed(1)}
                            </span>

                            <span>
                                {movie.vote_count.toLocaleString()}{" "}
                                votes
                            </span>

                            <span>
                                {movie.release_date ||
                                    "Unknown release date"}
                            </span>

                            {movie.runtime && (
                                <span>
                                    {movie.runtime} min
                                </span>
                            )}
                        </div>

                        {movie.genres &&
                            movie.genres.length > 0 && (
                                <div className="details-genres">
                                    {movie.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="genre-tag"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                        <p className="movie-overview">
                            {movie.overview ||
                                "No description available for this movie."}
                        </p>

                        <button
                            className={
                                favorite
                                    ? "favorite-large-button active"
                                    : "favorite-large-button"
                            }
                            onClick={() =>
                                toggleFavorite(movie)
                            }
                        >
                            {favorite
                                ? "♥ Remove from Favorites"
                                : "♡ Add to Favorites"}
                        </button>

                        <Link
                            to="/"
                            className="secondary-button"
                        >
                            Explore More Movies
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}