import { useEffect, useState } from "react";

import { useDebounce } from "../hooks/useDebounce";

interface SearchBarProps {
    /** The committed search term (e.g. from the URL). */
    value: string;
    placeholder?: string;
    debounceMs?: number;
    onSearch: (query: string) => void;
}

export default function SearchBar({
    value,
    placeholder = "Search movies and TV shows...",
    debounceMs = 400,
    onSearch,
}: SearchBarProps) {
    const [query, setQuery] = useState(value);
    const [previousValue, setPreviousValue] = useState(value);
    const debouncedQuery = useDebounce(query, debounceMs);

    // Keep the input in sync when the committed value changes from outside
    // (browser back/forward, "reset" buttons, ...). This adjusts state
    // during render, which React recommends over an effect for this case.
    if (value !== previousValue) {
        setPreviousValue(value);

        if (value !== query.trim()) {
            setQuery(value);
        }
    }

    // Live search: fire once the user pauses typing.
    useEffect(() => {
        const trimmed = debouncedQuery.trim();

        if (trimmed !== value) {
            onSearch(trimmed);
        }
        // `value` and `onSearch` intentionally omitted: we only want to react
        // to the user finishing typing, not to the parent re-rendering.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery]);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Enter searches immediately instead of waiting for the debounce.
        onSearch(query.trim());
    }

    return (
        <form className="search-bar" role="search" onSubmit={handleSubmit}>
            <input
                type="search"
                placeholder={placeholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search movies and TV shows"
            />

            <button type="submit">
                <span aria-hidden="true">🔍</span>
                <span>Search</span>
            </button>
        </form>
    );
}
