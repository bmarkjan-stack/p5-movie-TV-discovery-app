import { createContext } from "react";
import type { MediaItem, MediaType } from "../types/movie";

export interface FavoritesContextType {
    favorites: MediaItem[];
    isFavorite: (mediaType: MediaType, id: number) => boolean;
    toggleFavorite: (item: MediaItem) => void;
    removeFavorite: (mediaType: MediaType, id: number) => void;
}

export const FavoritesContext =
    createContext<FavoritesContextType | undefined>(undefined);