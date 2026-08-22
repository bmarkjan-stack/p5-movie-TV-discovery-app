import { useEffect, useState } from "react";

import GenreFilter from "../components/GenreFilter";
import ErrorMessage from "../components/ErrorMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import MovieGrid from "../components/MovieGrid";
import SearchBar from "../components/SearchBar";

import {
    getGenres,
    getMoviesByGenre,
    getPopularMovies,
    searchMovies,
} from "../services/movieApi";

import type { Genre, Movie } from "../types/movie";

export default function HomePage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(
        null
    );

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadInitialData() {
            try {
                const [popularMovies, movieGenres] =
                    await Promise.all([
                        getPopularMovies(),
                        getGenres(),
                    ]);

                if (cancelled) {
                    return;
                }

                setMovies(popularMovies);
                setGenres(movieGenres);
                setError(null);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load movies."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadInitialData();

        return () => {
            cancelled = true;
        };
    }, []);

    async function loadPopularMovies() {
        try {
            setLoading(true);
            setError(null);

            const popularMovies =
                await getPopularMovies();

            setMovies(popularMovies);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load movies."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(query: string) {
        try {
            setLoading(true);
            setError(null);
            setSearchQuery(query);
            setSelectedGenre(null);

            const results = await searchMovies(query);

            setMovies(results);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to search for movies."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleGenreChange(
        genreId: number | null
    ) {
        setSelectedGenre(genreId);
        setSearchQuery("");

        if (genreId === null) {
            await loadPopularMovies();
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const results =
                await getMoviesByGenre(genreId);

            setMovies(results);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load movies for this genre."
            );
        } finally {
            setLoading(false);
        }
    }

    const selectedGenreName =
        genres.find(
            (genre) => genre.id === selectedGenre
        )?.name;

    let sectionTitle = "Popular Movies";

    if (searchQuery) {
        sectionTitle = `Search Results for "${searchQuery}"`;
    } else if (selectedGenreName) {
        sectionTitle = `${selectedGenreName} Movies`;
    }

    return (
        <main>
            <section className="hero-section">
                <div className="hero-content">
                    <p className="hero-label">
                        DISCOVER YOUR NEXT FAVORITE
                    </p>

                    <h1>Find Movies You'll Love</h1>

                    <p className="hero-description">
                        Search thousands of movies, explore genres,
                        check ratings, and create your personal
                        favorites list.
                    </p>

                    <SearchBar
                        onSearch={handleSearch}
                        initialValue={searchQuery}
                    />
                </div>
            </section>

            <section className="content-section">
                <div className="section-heading">
                    <div>
                        <p className="section-label">
                            EXPLORE
                        </p>

                        <h2>{sectionTitle}</h2>
                    </div>

                    <span className="movie-count">
                        {movies.length} movies
                    </span>
                </div>

                {genres.length > 0 && (
                    <GenreFilter
                        genres={genres}
                        selectedGenre={selectedGenre}
                        onGenreChange={handleGenreChange}
                    />
                )}

                {loading && <LoadingSpinner />}

                {!loading && error && (
                    <ErrorMessage
                        message={error}
                        onRetry={loadPopularMovies}
                    />
                )}

                {!loading && !error && (
                    <MovieGrid movies={movies} />
                )}
            </section>
        </main>
    );
}