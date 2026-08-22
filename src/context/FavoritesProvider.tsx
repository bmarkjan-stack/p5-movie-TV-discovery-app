import {
    useEffect,
    useState,
    type ReactNode,
} from "react";

import type { Movie } from "../types/movie";
import { FavoritesContext } from "./FavoritesContext";

const STORAGE_KEY = "movie-finder-favorites";

interface FavoritesProviderProps {
    children: ReactNode;
}

export function FavoritesProvider({
    children,
}: FavoritesProviderProps) {
    const [favorites, setFavorites] = useState<Movie[]>(() => {
    try {
        const savedFavorites =
            localStorage.getItem(STORAGE_KEY);

        return savedFavorites
            ? (JSON.parse(savedFavorites) as Movie[])
            : [];
    } catch {
        return [];
    }
    });

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(favorites)
        );
    }, [favorites]);

    function isFavorite(movieId: number): boolean {
        return favorites.some(
            (movie) => movie.id === movieId
        );
    }

    function toggleFavorite(movie: Movie): void {
        setFavorites((currentFavorites) => {
            const exists = currentFavorites.some(
                (favorite) => favorite.id === movie.id
            );

            if (exists) {
                return currentFavorites.filter(
                    (favorite) => favorite.id !== movie.id
                );
            }

            return [...currentFavorites, movie];
        });
    }

    function removeFavorite(movieId: number): void {
        setFavorites((currentFavorites) =>
            currentFavorites.filter(
                (movie) => movie.id !== movieId
            )
        );
    }

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                isFavorite,
                toggleFavorite,
                removeFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}