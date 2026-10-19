import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { FavoritesProvider, FAVORITES_STORAGE_KEY } from "./FavoritesProvider";
import { useFavorites } from "./useFavorites";
import type { Movie, TVShow } from "../types/movie";

const movie: Movie = {
    id: 1,
    media_type: "movie",
    title: "Heat",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    release_date: "1995-12-15",
    vote_average: 8,
    vote_count: 100,
};

// Same numeric id as the movie on purpose: ids collide across TMDB types.
const show: TVShow = {
    id: 1,
    media_type: "tv",
    name: "Severance",
    overview: "",
    poster_path: null,
    backdrop_path: null,
    first_air_date: "2022-02-18",
    vote_average: 8.4,
    vote_count: 200,
};

const wrapper = ({ children }: { children: ReactNode }) => (
    <FavoritesProvider>{children}</FavoritesProvider>
);

describe("FavoritesProvider", () => {
    it("starts empty", () => {
        const { result } = renderHook(() => useFavorites(), { wrapper });
        expect(result.current.favorites).toEqual([]);
    });

    it("toggles a favorite on and off", () => {
        const { result } = renderHook(() => useFavorites(), { wrapper });

        act(() => result.current.toggleFavorite(movie));
        expect(result.current.isFavorite("movie", 1)).toBe(true);

        act(() => result.current.toggleFavorite(movie));
        expect(result.current.isFavorite("movie", 1)).toBe(false);
    });

    it("keeps a movie and a TV show with the same id separate", () => {
        const { result } = renderHook(() => useFavorites(), { wrapper });

        act(() => result.current.toggleFavorite(movie));

        expect(result.current.isFavorite("movie", 1)).toBe(true);
        expect(result.current.isFavorite("tv", 1)).toBe(false);

        act(() => result.current.toggleFavorite(show));
        expect(result.current.favorites).toHaveLength(2);

        act(() => result.current.removeFavorite("movie", 1));
        expect(result.current.favorites).toEqual([show]);
    });

    it("persists favorites to localStorage", () => {
        const { result } = renderHook(() => useFavorites(), { wrapper });

        act(() => result.current.toggleFavorite(movie));

        const stored = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!);
        expect(stored).toHaveLength(1);
        expect(stored[0].title).toBe("Heat");
    });

    it("migrates old favorites that have no media_type to movies", () => {
        const { media_type: _ignored, ...legacy } = movie;
        void _ignored;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([legacy]));

        const { result } = renderHook(() => useFavorites(), { wrapper });

        expect(result.current.favorites[0].media_type).toBe("movie");
        expect(result.current.isFavorite("movie", 1)).toBe(true);
    });

    it("throws when used outside the provider", () => {
        expect(() => renderHook(() => useFavorites())).toThrow(
            /inside FavoritesProvider/
        );
    });
});
