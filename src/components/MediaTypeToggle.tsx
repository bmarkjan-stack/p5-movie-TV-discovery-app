import type { MediaType } from "../types/movie";

interface MediaTypeToggleProps {
    value: MediaType;
    onChange: (mediaType: MediaType) => void;
}

const OPTIONS: { value: MediaType; label: string }[] = [
    { value: "movie", label: "Movies" },
    { value: "tv", label: "TV Shows" },
];

export default function MediaTypeToggle({
    value,
    onChange,
}: MediaTypeToggleProps) {
    return (
        <div className="media-toggle" role="group" aria-label="Content type">
            {OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={
                        value === option.value
                            ? "media-toggle-button active"
                            : "media-toggle-button"
                    }
                    aria-pressed={value === option.value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
