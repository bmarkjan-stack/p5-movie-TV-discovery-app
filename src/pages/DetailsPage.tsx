import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import { useFavorites } from "../context/useFavorites";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import {
    BACKDROP_BASE_URL,
    IMAGE_BASE_URL,
    getDetails,
} from "../services/movieApi";
import {
    getDisplayTitle,
    getReleaseDate,
    getRuntimeMinutes,
    type MediaItem,
    type MediaType,
} from "../types/movie";

interface DetailsPageProps {
    mediaType: MediaType;
}

interface DetailsState {
    key: string;
    item: MediaItem | null;
    error: string | null;
}

export default function DetailsPage({ mediaType }: DetailsPageProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isFavorite, toggleFavorite } = useFavorites();

    const [retryCount, setRetryCount] = useState(0);
    const [state, setState] = useState<DetailsState | null>(null);

    const missingId = !id;
    const requestKey = `${mediaType}:${id ?? ""}:${retryCount}`;
    const loading = !missingId && (state === null || state.key !== requestKey);
    const item = loading || !state ? null : state.item;
    const error = missingId
        ? "An ID was not provided."
        : loading || !state
          ? null
          : state.error;

    useEffect(() => {
        let cancelled = false;

        if (!id) {
            return;
        }

        getDetails(mediaType, id)
            .then((result) => {
                if (!cancelled) setState({ key: requestKey, item: result, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;

                setState({
                    key: requestKey,
                    item: null,
                    error:
                        err instanceof Error
                            ? err.message
                            : "Unable to load details.",
                });
            });

        return () => {
            cancelled = true;
        };
    }, [id, mediaType, requestKey]);

    useDocumentMeta(
        item ? getDisplayTitle(item) : loading ? "Loading..." : "Not found",
        item?.overview?.slice(0, 160)
    );

    if (loading) {
        return (
            <main className="details-page">
                <LoadingSpinner label="Loading details..." />
            </main>
        );
    }

    if (error || !item) {
        return (
            <main className="details-page">
                <ErrorMessage
                    message={error ?? "This title could not be found."}
                    onRetry={() => setRetryCount((count) => count + 1)}
                />
            </main>
        );
    }

    const title = getDisplayTitle(item);
    const favorite = isFavorite(item.media_type, item.id);
    const runtime = getRuntimeMinutes(item);
    const releaseDate = getReleaseDate(item);

    const posterUrl = item.poster_path
        ? `${IMAGE_BASE_URL}${item.poster_path}`
        : "/placeholder-poster.svg";

    const backdropUrl = item.backdrop_path
        ? `${BACKDROP_BASE_URL}${item.backdrop_path}`
        : undefined;

    return (
        <main className="details-page">
            <div
                className="details-backdrop"
                aria-hidden="true"
                style={
                    backdropUrl
                        ? {
                              backgroundImage: `linear-gradient(rgba(10, 10, 15, 0.25), rgba(10, 10, 15, 0.98)), url(${backdropUrl})`,
                          }
                        : undefined
                }
            />

            <div className="details-container">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="details-content">
                    <div className="details-poster-container">
                        <img
                            src={posterUrl}
                            alt={`${title} poster`}
                            className="details-poster"
                        />
                    </div>

                    <div className="details-information">
                        <p className="section-label">
                            {item.media_type === "movie" ? "MOVIE DETAILS" : "TV SHOW DETAILS"}
                        </p>

                        <h1>{title}</h1>

                        {item.tagline && <p className="tagline">“{item.tagline}”</p>}

                        <div className="details-meta">
                            <span className="large-rating">
                                ★ {item.vote_average.toFixed(1)}
                            </span>
                            <span>{item.vote_count.toLocaleString()} votes</span>
                            <span>{releaseDate || "Unknown release date"}</span>
                            {runtime ? <span>{runtime} min</span> : null}
                            {item.media_type === "tv" && item.number_of_seasons ? (
                                <span>
                                    {item.number_of_seasons}{" "}
                                    {item.number_of_seasons === 1 ? "season" : "seasons"}
                                    {item.number_of_episodes
                                        ? ` · ${item.number_of_episodes} episodes`
                                        : ""}
                                </span>
                            ) : null}
                        </div>

                        {item.genres && item.genres.length > 0 && (
                            <div className="details-genres">
                                {item.genres.map((genre) => (
                                    <span key={genre.id} className="genre-tag">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="movie-overview">
                            {item.overview || "No description available."}
                        </p>

                        <button
                            type="button"
                            className={
                                favorite
                                    ? "favorite-large-button active"
                                    : "favorite-large-button"
                            }
                            aria-pressed={favorite}
                            onClick={() => toggleFavorite(item)}
                        >
                            {favorite ? "♥ Remove from Favorites" : "♡ Add to Favorites"}
                        </button>

                        <Link to={item.media_type === "tv" ? "/?type=tv" : "/"} className="secondary-button">
                            Explore More {item.media_type === "tv" ? "TV Shows" : "Movies"}
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
