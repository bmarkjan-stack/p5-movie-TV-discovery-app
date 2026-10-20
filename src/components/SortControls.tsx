import { SORT_LABELS, isSortKey, type SortKey } from "../services/sortOptions";

export interface FilterValues {
    sort: SortKey;
    minRating: number;
    yearFrom: number | null;
    yearTo: number | null;
}

interface SortControlsProps {
    values: FilterValues;
    onChange: (changes: Partial<FilterValues>) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

const RATING_OPTIONS = [0, 5, 6, 7, 8];
const CURRENT_YEAR = new Date().getFullYear();

function parseYear(raw: string): number | null {
    const year = Number.parseInt(raw, 10);

    return Number.isInteger(year) && year >= 1900 && year <= CURRENT_YEAR + 1
        ? year
        : null;
}

export default function SortControls({
    values,
    onChange,
    onReset,
    hasActiveFilters,
}: SortControlsProps) {
    return (
        <div className="sort-controls" role="group" aria-label="Sort and filter">
            <label className="control-field">
                <span>Sort by</span>
                <select
                    value={values.sort}
                    onChange={(event) => {
                        if (isSortKey(event.target.value)) {
                            onChange({ sort: event.target.value });
                        }
                    }}
                >
                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="control-field">
                <span>Min rating</span>
                <select
                    value={values.minRating}
                    onChange={(event) =>
                        onChange({ minRating: Number(event.target.value) })
                    }
                >
                    {RATING_OPTIONS.map((rating) => (
                        <option key={rating} value={rating}>
                            {rating === 0 ? "Any" : `${rating}+ ★`}
                        </option>
                    ))}
                </select>
            </label>

            {/* key={value} remounts the input after a commit so it always
                shows the URL's current value, e.g. after "Reset". */}
            <label className="control-field">
                <span>From year</span>
                <input
                    key={`from-${values.yearFrom ?? ""}`}
                    type="number"
                    inputMode="numeric"
                    min={1900}
                    max={CURRENT_YEAR + 1}
                    placeholder="Any"
                    defaultValue={values.yearFrom ?? ""}
                    onBlur={(event) =>
                        onChange({ yearFrom: parseYear(event.target.value) })
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                    }}
                />
            </label>

            <label className="control-field">
                <span>To year</span>
                <input
                    key={`to-${values.yearTo ?? ""}`}
                    type="number"
                    inputMode="numeric"
                    min={1900}
                    max={CURRENT_YEAR + 1}
                    placeholder="Any"
                    defaultValue={values.yearTo ?? ""}
                    onBlur={(event) =>
                        onChange({ yearTo: parseYear(event.target.value) })
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter") event.currentTarget.blur();
                    }}
                />
            </label>

            {hasActiveFilters && (
                <button type="button" className="reset-button" onClick={onReset}>
                    Reset filters
                </button>
            )}
        </div>
    );
}
