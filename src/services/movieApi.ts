import type {
    Genre,
    GenreResponse,
    Movie,
    MovieResponse,
} from "../types/movie";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

async function request<T>(endpoint: string): Promise<T> {
    if (!API_KEY) {
        throw new Error(
            "TMDB API key is missing. Please add VITE_TMDB_API_KEY to your .env file."
        );
    }

    const separator = endpoint.includes("?") ? "&" : "?";
    const response = await fetch(
        `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error(
            `Unable to fetch movie data. Server returned ${response.status}.`
        );
    }

    return response.json() as Promise<T>;
}

export async function getPopularMovies(): Promise<Movie[]> {
    const data = await request<MovieResponse>("/movie/popular");
    return data.results;
}

export async function searchMovies(
    query: string
): Promise<Movie[]> {
    const data = await request<MovieResponse>(
        `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
    );

    return data.results;
}

export async function getMovieDetails(
    movieId: string
): Promise<Movie> {
    return request<Movie>(`/movie/${movieId}`);
}

export async function getGenres(): Promise<Genre[]> {
    const data = await request<GenreResponse>(
        "/genre/movie/list"
    );

    return data.genres;
}

export async function getMoviesByGenre(
    genreId: number
): Promise<Movie[]> {
    const data = await request<MovieResponse>(
        `/discover/movie?with_genres=${genreId}&sort_by=popularity.desc`
    );

    return data.results;
}