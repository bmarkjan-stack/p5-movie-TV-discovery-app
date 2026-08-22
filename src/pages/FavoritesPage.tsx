import { Link } from "react-router-dom";

import MovieGrid from "../components/MovieGrid";
import { useFavorites } from "../context/useFavorites";

export default function FavoritesPage() {
    const { favorites } = useFavorites();

    return (
        <main className="content-page">
            <section className="content-section">
                <div className="section-heading">
                    <div>
                        <p className="section-label">
                            YOUR COLLECTION
                        </p>
                        <h1>Favorite Movies</h1>
                    </div>
                    <span className="movie-count">
                        {favorites.length} saved
                    </span>
                </div>

                {favorites.length > 0 ? (
                    <MovieGrid movies={favorites} />
                ) : (
                <div className="empty-state">
                    <div className="empty-icon">♡</div>
                    <h2>No favorites yet</h2>
                    <p>
                        Start exploring movies and add your
                        favorites to build your collection.
                    </p>
                    <Link
                        to="/"
                        className="primary-button"
                        >
                        Discover Movies
                    </Link>
                </div>
                )}
            </section>
        </main>
    );
}