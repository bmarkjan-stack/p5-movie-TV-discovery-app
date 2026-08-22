export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids?: number[];
    genres?: Genre[];
    runtime?: number;
    tagline?: string;
    popularity?: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface MovieResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface GenreResponse {
    genres: Genre[];
}