import { useState } from "react";

interface SearchBarProps {
    initialValue?: string;
    onSearch: (query: string) => void;
}

export default function SearchBar({
    initialValue = "",
    onSearch,
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);

    function handleSubmit(
        event: React.SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            onSearch(trimmedQuery);
        }
    }

    return (
        <form
            className="search-bar"
            onSubmit={handleSubmit}
        >
            <input
                type="search"
                placeholder="Search movies..."
                value={query}
                onChange={(event) =>
                    setQuery(event.target.value)
                }
                aria-label="Search movies"
            />

            <button type="submit">
                <span aria-hidden="true">🔍</span>
                <span>Search</span>
            </button>
        </form>
    );
}