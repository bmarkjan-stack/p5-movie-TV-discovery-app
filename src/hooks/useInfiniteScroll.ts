import { useEffect, useRef } from "react";

interface Options {
    enabled: boolean;
    onLoadMore: () => void;
    rootMargin?: string;
}

/**
 * Attach the returned ref to a sentinel element at the bottom of a list.
 * When it scrolls into view (and `enabled` is true) `onLoadMore` fires.
 */
export function useInfiniteScroll<T extends HTMLElement>({
    enabled,
    onLoadMore,
    rootMargin = "400px",
}: Options) {
    const sentinelRef = useRef<T | null>(null);
    const callbackRef = useRef(onLoadMore);

    useEffect(() => {
        callbackRef.current = onLoadMore;
    }, [onLoadMore]);

    useEffect(() => {
        const node = sentinelRef.current;

        if (!enabled || !node || typeof IntersectionObserver === "undefined") {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    callbackRef.current();
                }
            },
            { rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [enabled, rootMargin]);

    return sentinelRef;
}
