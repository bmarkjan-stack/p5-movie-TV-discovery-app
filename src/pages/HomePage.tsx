import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ErrorMessage from "../components/ErrorMessage";
import GenreFilter from "../components/GenreFilter";
import MediaTypeToggle from "../components/MediaTypeToggle";
import MovieGrid from "../components/MovieGrid";
import SearchBar from "../components/SearchBar";
import SkeletonGrid from "../components/SkeletonGrid";
import SortControls, { type FilterValues } from "../components/SortControls";

import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
    discoverMedia,
    getGenres,
    searchMedia,
} from "../services/movieApi";
import {
    DEFAULT_SORT,
    isSortKey,
    toTmdbSort,
} from "../services/sortOptions";
import type { Genre, MediaItem, MediaType } from "../types/movie";

interface ListState {
    key: string;
    items: MediaItem[];
    page: number;
    totalPages: number;
    error: string | null;
}

interface GenreState {
    mediaType: MediaType;
    genres: Genre[];
}

function parseIntParam(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
}

function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : "Unable to load results.";
}

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ---- state that lives in the URL (shareable, survives refresh) ----
    const query = searchParams.get("q")?.trim() ?? "";
    const mediaType: MediaType =
        searchParams.get("type") === "tv" ? "tv" : "movie";
    const genreId = parseIntParam(searchParams.get("genre"));
    const sortParam = searchParams.get("sort");
    const sort = isSortKey(sortParam) ? sortParam : DEFAULT_SORT;
    const minRating = parseIntParam(searchParams.get("rating")) ?? 0;
    const yearFrom = parseIntParam(searchParams.get("from"));
    const yearTo = parseIntParam(searchParams.get("to"));

    const isSearching = query.length > 0;
    const hasActiveFilters =
        sort !== DEFAULT_SORT ||
        minRating > 0 ||
        yearFrom !== null ||
        yearTo !== null;

    // ---- transient state ----
    const [retryCount, setRetryCount] = useState(0);
    const [list, setList] = useState<ListState | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const [genreState, setGenreState] = useState<GenreState | null>(null);

    // Identifies "which list are we looking at". When it changes we start
    // over from page 1. Loading is *derived* from this instead of being a
    // separate flag, which avoids a whole class of stale-state bugs.
    const requestKey = JSON.stringify([
        mediaType,
        query,
        genreId,
        sort,
        minRating,
        yearFrom,
        yearTo,
        retryCount,
    ]);

    const loading = list === null || list.key !== requestKey;
    const currentList = loading ? null : list;

    const fetchPage = useCallback(
        (page: number) =>
            isSearching
                ? searchMedia(mediaType, query, page)
                : discoverMedia(mediaType, {
                      genreId,
                      sortBy: toTmdbSort(mediaType, sort),
                      minRating: minRating || undefined,
                      yearFrom: yearFrom ?? undefined,
                      yearTo: yearTo ?? undefined,
                      page,
                  }),
        [isSearching, mediaType, query, genreId, sort, minRating, yearFrom, yearTo]
    );

    // ---- load page 1 whenever the request changes ----
    useEffect(() => {
        let cancelled = false;

        fetchPage(1)
            .then((result) => {
                if (cancelled) return;

                setLoadMoreError(null);
                setList({
                    key: requestKey,
                    items: result.results,
                    page: result.page,
                    totalPages: result.totalPages,
                    error: null,
                });
            })
            .catch((err: unknown) => {
                if (cancelled) return;

                setList({
                    key: requestKey,
                    items: [],
                    page: 1,
                    totalPages: 1,
                    error: errorMessage(err),
                });
            });

        return () => {
            cancelled = true;
        };
    }, [fetchPage, requestKey]);

    // ---- load genres whenever the media type changes ----
    useEffect(() => {
        let cancelled = false;

        getGenres(mediaType)
            .then((genres) => {
                if (!cancelled) setGenreState({ mediaType, genres });
            })
            .catch(() => {
                // Genres are a nice-to-have; the page still works without them.
                if (!cancelled) setGenreState({ mediaType, genres: [] });
            });

        return () => {
            cancelled = true;
        };
    }, [mediaType]);

    const genres =
        genreState?.mediaType === mediaType ? genreState.genres : [];

    // ---- pagination ----
    const hasMore =
        currentList !== null &&
        currentList.error === null &&
        currentList.page < currentList.totalPages;

    async function loadMore() {
        if (!currentList || loadingMore || !hasMore) return;

        setLoadingMore(true);
        setLoadMoreError(null);

        try {
            const result = await fetchPage(currentList.page + 1);

            setList((current) => {
                if (!current || current.key !== requestKey) return current;

                // TMDB pages can overlap slightly while rankings shift.
                const seen = new Set(
                    current.items.map((item) => `${item.media_type}-${item.id}`)
                );
                const fresh = result.results.filter(
                    (item) => !seen.has(`${item.media_type}-${item.id}`)
                );

                return {
                    ...current,
                    items: [...current.items, ...fresh],
                    page: result.page,
                    totalPages: result.totalPages,
                };
            });
        } catch (err) {
            setLoadMoreError(errorMessage(err));
        } finally {
            setLoadingMore(false);
        }
    }

    const sentinelRef = useInfiniteScroll<HTMLDivElement>({
        enabled: hasMore && !loadingMore && loadMoreError === null,
        onLoadMore: () => void loadMore(),
    });

    // ---- URL update helpers ----
    function updateParams(
        changes: Record<string, string | null>,
        options: { replace?: boolean } = {}
    ) {
        setSearchParams(
            (previous) => {
                const next = new URLSearchParams(previous);

                for (const [key, value] of Object.entries(changes)) {
                    if (value === null || value === "") {
                        next.delete(key);
                    } else {
                        next.set(key, value);
                    }
                }

                return next;
            },
            { replace: options.replace }
        );
    }

    const handleSearch = useCallback(
        (value: string) => {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous);

                    if (value) {
                        next.set("q", value);
                    } else {
                        next.delete("q");
                    }

                    return next;
                },
                // Replace so every pause in typing doesn't add a history entry.
                { replace: true }
            );
        },
        [setSearchParams]
    );

    function handleMediaTypeChange(next: MediaType) {
        // Movie and TV genre ids differ, so a genre can't carry across.
        updateParams({ type: next === "movie" ? null : next, genre: null });
    }

    function handleFilterChange(changes: Partial<FilterValues>) {
        const params: Record<string, string | null> = {};

        if ("sort" in changes) {
            params.sort = changes.sort === DEFAULT_SORT ? null : changes.sort ?? null;
        }
        if ("minRating" in changes) {
            params.rating = changes.minRating ? String(changes.minRating) : null;
        }
        if ("yearFrom" in changes) {
            params.from = changes.yearFrom ? String(changes.yearFrom) : null;
        }
        if ("yearTo" in changes) {
            params.to = changes.yearTo ? String(changes.yearTo) : null;
        }

        updateParams(params);
    }

    function handleReset() {
        updateParams({ sort: null, rating: null, from: null, to: null });
    }

    // ---- headings, meta, announcements ----
    const noun = mediaType === "movie" ? "Movies" : "TV Shows";
    const activeGenre = genres.find((genre) => genre.id === genreId);

    const heading = isSearching
        ? `Results for “${query}”`
        : activeGenre
          ? `${activeGenre.name} ${noun}`
          : `Discover ${noun}`;

    useDocumentMeta(
        isSearching ? `Search: ${query}` : `Discover ${noun}`,
        `Browse, search and save popular ${noun.toLowerCase()} with Movie Finder.`
    );

    const resultCount = currentList?.items.length ?? 0;
    const announcement = loading
        ? "Loading results"
        : currentList?.error
          ? "Failed to load results"
          : `${resultCount} ${resultCount === 1 ? "result" : "results"} loaded`;

    return (
        <main className="content-page">
            <section className="hero-section">
                <div className="hero-content">
                    <p className="hero-label">TMDB DISCOVERY</p>
                    <h1>Find your next favorite {mediaType === "movie" ? "movie" : "show"}</h1>
                    <p className="hero-description">
                        Search thousands of movies and TV shows, filter by
                        genre, and save what you want to watch.
                    </p>

                    <SearchBar
                        value={query}
                        placeholder={`Search ${noun.toLowerCase()}...`}
                        onSearch={handleSearch}
                    />

                    <MediaTypeToggle
                        value={mediaType}
                        onChange={handleMediaTypeChange}
                    />
                </div>
            </section>

            <section className="content-section">
                {!isSearching && (
                    <>
                        <GenreFilter
                            genres={genres}
                            selectedGenre={genreId}
                            onGenreChange={(id) =>
                                updateParams({ genre: id ? String(id) : null })
                            }
                        />

                        <SortControls
                            values={{ sort, minRating, yearFrom, yearTo }}
                            onChange={handleFilterChange}
                            onReset={handleReset}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </>
                )}

                <div className="section-heading">
                    <h2>{heading}</h2>
                    {currentList && !currentList.error && (
                        <span className="movie-count">{resultCount} shown</span>
                    )}
                </div>

                <p className="sr-only" role="status" aria-live="polite">
                    {announcement}
                </p>

                {loading && <SkeletonGrid count={10} />}

                {currentList?.error && (
                    <ErrorMessage
                        message={currentList.error}
                        onRetry={() => setRetryCount((count) => count + 1)}
                    />
                )}

                {currentList && !currentList.error && (
                    <>
                        <MovieGrid
                            items={currentList.items}
                            emptyTitle={`No ${noun.toLowerCase()} found`}
                        />

                        {loadingMore && <SkeletonGrid count={5} />}

                        {loadMoreError && (
                            <ErrorMessage
                                message={loadMoreError}
                                onRetry={() => void loadMore()}
                            />
                        )}

                        {hasMore && !loadMoreError && (
                            <div className="load-more" ref={sentinelRef}>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => void loadMore()}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? "Loading..." : "Load more"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
