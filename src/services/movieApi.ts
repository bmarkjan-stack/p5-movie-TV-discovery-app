import type {
    Genre,
    GenreResponse,
    Movie,
    MovieResponse,
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