import type { Movie } from "../types/movie";
import MovieCard from "./MovieCard";

interface MovieGridProps {
    movies: Movie[];
}

export default function MovieGrid({
    movies,
}: MovieGridProps) {
    if (movies.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🎬</div>
                <h2>No movies found</h2>
                <p>
                    Try another search or select a different
                    genre.
                </p>
            </div>
        );
    }

    return (
        <div className="movie-grid">
            {movies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    movie={movie}
                />
            ))}
        </div>
    );
}