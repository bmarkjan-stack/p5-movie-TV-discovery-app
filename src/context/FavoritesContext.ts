import { createContext } from "react";
import type { Movie } from "../types/movie";

export interface FavoritesContextType {
    favorites: Movie[];
    isFavorite: (movieId: number) => boolean;
    toggleFavorite: (movie: Movie) => void;
    removeFavorite: (movieId: number) => void;
}

export const FavoritesContext =
    createContext<FavoritesContextType | undefined>(
        undefined
  );