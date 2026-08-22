import type { Genre } from "../types/movie";

interface GenreFilterProps {
    genres: Genre[];
    selectedGenre: number | null;
    onGenreChange: (genreId: number | null) => void;
}

export default function GenreFilter({
    genres,
    selectedGenre,
    onGenreChange,
}: GenreFilterProps) {
    return (
        <div className="genre-filter">
            <button
                className={
                    selectedGenre === null
                        ? "genre-button active"
                        : "genre-button"
                }
                onClick={() => onGenreChange(null)}
            >
                All
            </button>

        {genres.map((genre) => (
            <button
                key={genre.id}
                className={
                    selectedGenre === genre.id
                        ? "genre-button active"
                        : "genre-button"
                }
                onClick={() =>
                    onGenreChange(genre.id)
                }
            >
                {genre.name}
            </button>
        ))}
        </div>
    );
}