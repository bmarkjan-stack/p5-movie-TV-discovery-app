import type {
    DiscoverParams,
    Genre,
    GenreResponse,
    MediaItem,
    MediaType,
    PaginatedResult,
    RawListResponse,
} from "../types/movie";

import { getCached, setCached } from "./cache";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";

// --- API key handling -----------------------------------------------------
//
// Three ways to reach TMDB, tried in this order:
//
// 1. VITE_TMDB_PROXY_URL: a serverless proxy (see /api/tmdb.ts) that keeps
//    your real TMDB token on the server. This is the recommended setup for
//    anything you deploy publicly, since it never ships the key to the
//    browser at all.
// 2. VITE_TMDB_READ_TOKEN: a TMDB v4 "Read Access Token", sent as an
//    Authorization header. It's still visible in devtools if someone opens
//    them, but it no longer leaks into the URL, browser history, or
//    server access logs the way a query-string key does.
// 3. VITE_TMDB_API_KEY: the legacy v3 key, kept only for backwards
//    compatibility with the original .env setup.
const PROXY_BASE = import.meta.env.VITE_TMDB_PROXY_URL as string | undefined;
const READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN as string | undefined;
const LEGACY_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;

function buildRequestUrl(endpoint: string): { url: string; headers: HeadersInit } {
    if (PROXY_BASE) {
        return {
            url: `${PROXY_BASE}?path=${encodeURIComponent(endpoint)}`,
            headers: {},
        };
    }

    if (READ_TOKEN) {
        return {
            url: `${BASE_URL}${endpoint}`,
            headers: { Authorization: `Bearer ${READ_TOKEN}` },
        };
    }

    if (LEGACY_API_KEY) {
        const separator = endpoint.includes("?") ? "&" : "?";
        return {
            url: `${BASE_URL}${endpoint}${separator}api_key=${LEGACY_API_KEY}`,
            headers: {},
        };
    }

    throw new Error(
        "TMDB credentials are missing. Set VITE_TMDB_PROXY_URL, " +
            "VITE_TMDB_READ_TOKEN, or VITE_TMDB_API_KEY in your .env file."
    );
}

async function request<T>(endpoint: string, useCache = true): Promise<T> {
    if (useCache) {
        const cached = getCached<T>(endpoint);
        if (cached) {
            return cached;
        }
    }

    const { url, headers } = buildRequestUrl(endpoint);
    const response = await fetch(url, { headers });

    if (!response.ok) {
        throw new Error(
            `Unable to fetch data from TMDB. Server returned ${response.status}.`
        );
    }

    const data = (await response.json()) as T;

    if (useCache) {
        setCached(endpoint, data);
    }

    return data;
}

// --- helpers ---------------------------------------------------------------

function tagMediaType<T extends { id: number }>(
    items: T[],
    mediaType: MediaType
): MediaItem[] {
    return items.map(
        (item) => ({ ...item, media_type: mediaType }) as unknown as MediaItem
    );
}

function toPaginatedResult<T extends { id: number }>(
    raw: RawListResponse<T>,
    mediaType: MediaType
): PaginatedResult<MediaItem> {
    return {
        results: tagMediaType(raw.results, mediaType),
        page: raw.page,
        // TMDB rejects requests for pages above 500 even when total_pages
        // reports more, so cap it to avoid a guaranteed error at the end.
        totalPages: Math.min(raw.total_pages, 500),
        totalResults: raw.total_results,
    };
}

function detailsEndpoint(mediaType: MediaType, id: string | number): string {
    return `/${mediaType}/${id}`;
}

// --- public API --------------------------------------------------------------

export async function getPopular(
    mediaType: MediaType,
    page = 1
): Promise<PaginatedResult<MediaItem>> {
    const raw = await request<RawListResponse<MediaItem>>(
        `/${mediaType}/popular?page=${page}`
    );

    return toPaginatedResult(raw, mediaType);
}

export async function searchMedia(
    mediaType: MediaType,
    query: string,
    page = 1
): Promise<PaginatedResult<MediaItem>> {
    const raw = await request<RawListResponse<MediaItem>>(
        `/search/${mediaType}?query=${encodeURIComponent(
            query
        )}&include_adult=false&page=${page}`
    );

    return toPaginatedResult(raw, mediaType);
}

export async function getDetails(
    mediaType: MediaType,
    id: string
): Promise<MediaItem> {
    const raw = await request<Omit<MediaItem, "media_type">>(
        detailsEndpoint(mediaType, id)
    );

    return { ...raw, media_type: mediaType } as MediaItem;
}

export async function getGenres(mediaType: MediaType): Promise<Genre[]> {
    const data = await request<GenreResponse>(`/genre/${mediaType}/list`);
    return data.genres;
}

/**
 * Unified discover call used for browsing (genre filter, sort order, year
 * range, minimum rating). This replaces the old getPopularMovies /
 * getMoviesByGenre pair with a single, fully-parameterized endpoint.
 */
export async function discoverMedia(
    mediaType: MediaType,
    params: DiscoverParams = {}
): Promise<PaginatedResult<MediaItem>> {
    const {
        genreId,
        sortBy = "popularity.desc",
        minRating,
        yearFrom,
        yearTo,
        page = 1,
    } = params;

    const dateField =
        mediaType === "movie" ? "primary_release_date" : "first_air_date";

    const searchParams = new URLSearchParams({
        sort_by: sortBy,
        page: String(page),
        // Rating sort needs a bigger vote floor, otherwise obscure titles
        // with a handful of 10/10 votes dominate the list.
        "vote_count.gte": sortBy.startsWith("vote_average") ? "200" : "10",
    });

    if (genreId) {
        searchParams.set("with_genres", String(genreId));
    }

    if (minRating) {
        searchParams.set("vote_average.gte", String(minRating));
    }

    if (yearFrom) {
        searchParams.set(`${dateField}.gte`, `${yearFrom}-01-01`);
    }

    if (yearTo) {
        searchParams.set(`${dateField}.lte`, `${yearTo}-12-31`);
    }

    const raw = await request<RawListResponse<MediaItem>>(
        `/discover/${mediaType}?${searchParams.toString()}`
    );

    return toPaginatedResult(raw, mediaType);
}