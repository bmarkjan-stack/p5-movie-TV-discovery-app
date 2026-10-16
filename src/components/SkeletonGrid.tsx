import SkeletonCard from "./SkeletonCard";

interface SkeletonGridProps {
    count?: number;
}

export default function SkeletonGrid({ count = 10 }: SkeletonGridProps) {
    return (
        <div className="movie-grid" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}
