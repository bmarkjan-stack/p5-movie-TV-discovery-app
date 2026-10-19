export type MediaType = "movie" | "tv";

export interface Genre {
    id: number;
    name: string;
}

interface BaseMedia {
    id: number;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    genre_ids?: number[];
    genres?: Genre[];
    popularity?: number;
    tagline?: string;
}

export interface Movie extends BaseMedia {
    media_type: "movie";
    title: string;
    release_date: string;
    runtime?: number;
}

export interface TVShow extends BaseMedia {
    media_type: "tv";
    name: string;
    first_air_date: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
    episode_run_time?: number[];
}

export type MediaItem = Movie | TVShow;

export interface GenreResponse {
    genres: Genre[];
}

/** Raw shape TMDB returns for list endpoints, before we tag media_type. */
export interface RawListResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}

export interface PaginatedResult<T> {
    results: T[];
    page: number;
    totalPages: number;
    totalResults: number;
}

export interface DiscoverParams {
    genreId?: number | null;
    sortBy?: string;
    minRating?: number;
    yearFrom?: number;
    yearTo?: number;
    page?: number;
}

export function getDisplayTitle(item: MediaItem): string {
    return item.media_type === "movie" ? item.title : item.name;
}

export function getReleaseDate(item: MediaItem): string {
    return item.media_type === "movie"
        ? item.release_date
        : item.first_air_date;
}

export function getRuntimeMinutes(item: MediaItem): number | undefined {
    if (item.media_type === "movie") {
        return item.runtime;
    }

    return item.episode_run_time?.[0];
}
