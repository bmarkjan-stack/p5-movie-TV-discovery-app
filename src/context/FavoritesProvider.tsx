import { useEffect, useState, type ReactNode } from "react";

import type { MediaItem, MediaType } from "../types/movie";
import { FavoritesContext } from "./FavoritesContext";

export const FAVORITES_STORAGE_KEY = "movie-finder-favorites";

interface FavoritesProviderProps {
    children: ReactNode;
}

function loadFavorites(): MediaItem[] {
    try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved) as Partial<MediaItem>[];

        // Favorites saved before TV support existed have no media_type.
        // They were all movies, so migrate them instead of dropping them.
        return parsed.map(
            (item) =>
                ({ ...item, media_type: item.media_type ?? "movie" }) as MediaItem
        );
    } catch {
        return [];
    }
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
    const [favorites, setFavorites] = useState<MediaItem[]>(loadFavorites);

    useEffect(() => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    function isFavorite(mediaType: MediaType, id: number): boolean {
        return favorites.some(
            (item) => item.media_type === mediaType && item.id === id
        );
    }

    function toggleFavorite(item: MediaItem): void {
        setFavorites((current) => {
            const exists = current.some(
                (fav) => fav.media_type === item.media_type && fav.id === item.id
            );

            return exists
                ? current.filter(
                    (fav) =>
                        !(fav.media_type === item.media_type && fav.id === item.id)
                )
                : [...current, item];
        });
    }

    function removeFavorite(mediaType: MediaType, id: number): void {
        setFavorites((current) =>
            current.filter(
                (fav) => !(fav.media_type === mediaType && fav.id === id)
            )
        );
    }

    return (
        <FavoritesContext.Provider
            value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}
