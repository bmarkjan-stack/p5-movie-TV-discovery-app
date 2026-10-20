import { useState } from "react";
import { Link } from "react-router-dom";

import MediaTypeToggle from "../components/MediaTypeToggle";
import MovieGrid from "../components/MovieGrid";
import { useFavorites } from "../context/useFavorites";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import type { MediaType } from "../types/movie";

export default function FavoritesPage() {
    const { favorites } = useFavorites();
    const [mediaType, setMediaType] = useState<MediaType | "all">("all");

    useDocumentMeta("Favorites", "Your saved movies and TV shows.");

    const visible =
        mediaType === "all"
            ? favorites
            : favorites.filter((item) => item.media_type === mediaType);

    return (
        <main className="content-page">
            <section className="content-section">
                <div className="section-heading">
                    <div>
                        <p className="section-label">YOUR COLLECTION</p>
                        <h1>Favorites</h1>
                    </div>
                    <span className="movie-count">{favorites.length} saved</span>
                </div>

                {favorites.length > 0 ? (
                    <>
                        <div className="favorites-filter">
                            <button
                                type="button"
                                className={
                                    mediaType === "all"
                                        ? "genre-button active"
                                        : "genre-button"
                                }
                                aria-pressed={mediaType === "all"}
                                onClick={() => setMediaType("all")}
                            >
                                All
                            </button>
                            <MediaTypeToggle
                                value={mediaType === "all" ? "movie" : mediaType}
                                onChange={setMediaType}
                            />
                        </div>

                        <MovieGrid
                            items={visible}
                            emptyTitle="No favorites of this type"
                        />
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon" aria-hidden="true">♡</div>
                        <h2>No favorites yet</h2>
                        <p>
                            Start exploring and add titles to build your
                            collection.
                        </p>
                        <Link to="/" className="primary-button">
                            Discover Movies &amp; TV
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
