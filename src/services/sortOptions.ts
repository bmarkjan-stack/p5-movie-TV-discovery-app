import type { MediaType } from "../types/movie";

export type SortKey = "popularity" | "rating" | "newest" | "oldest";

export const DEFAULT_SORT: SortKey = "popularity";

export const SORT_LABELS: Record<SortKey, string> = {
    popularity: "Most popular",
    rating: "Highest rated",
    newest: "Newest first",
    oldest: "Oldest first",
};

export function isSortKey(value: string | null): value is SortKey {
    return value !== null && value in SORT_LABELS;
}

/** Translates our friendly sort key into TMDB's `sort_by` value. */
export function toTmdbSort(mediaType: MediaType, key: SortKey): string {
    const dateField =
        mediaType === "movie" ? "primary_release_date" : "first_air_date";

    switch (key) {
        case "rating":
            return "vote_average.desc";
        case "newest":
            return `${dateField}.desc`;
        case "oldest":
            return `${dateField}.asc`;
        default:
            return "popularity.desc";
    }
}
