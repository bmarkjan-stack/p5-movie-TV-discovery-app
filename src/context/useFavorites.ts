import { useContext } from "react";

import {
    FavoritesContext,
    type FavoritesContextType,
} from "./FavoritesContext";

export function useFavorites(): FavoritesContextType {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error(
            "useFavorites must be used inside FavoritesProvider"
        );
    }

    return context;
}