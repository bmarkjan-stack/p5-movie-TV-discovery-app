import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearCache } from "./cache";

// The module reads credentials from import.meta.env at load time, so we set
// them up front and import the module dynamically inside each test.
async function loadApi() {
    vi.resetModules();
    vi.stubEnv("VITE_TMDB_READ_TOKEN", "test-token");
    vi.stubEnv("VITE_TMDB_PROXY_URL", "");
    vi.stubEnv("VITE_TMDB_API_KEY", "");
    return import("./movieApi");
}

function mockFetchOnce(body: unknown, ok = true, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok,
        status,
        json: async () => body,
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

const listBody = {
    page: 1,
    total_pages: 3,
    total_results: 60,
    results: [{ id: 1, title: "Heat", name: "Heat" }],
};

describe("movieApi", () => {
    beforeEach(() => {
        clearCache();
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it("sends the token as a Bearer header, not in the URL", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { getPopular } = await loadApi();

        await getPopular("movie", 1);

        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe("https://api.themoviedb.org/3/movie/popular?page=1");
        expect(url).not.toContain("api_key");
        expect(options.headers).toEqual({ Authorization: "Bearer test-token" });
    });

    it("passes the page param through for pagination", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { getPopular } = await loadApi();

        await getPopular("movie", 3);

        expect(fetchMock.mock.calls[0][0]).toContain("page=3");
    });

    it("tags results with their media type and hits the TV endpoints", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { getPopular } = await loadApi();

        const result = await getPopular("tv", 1);

        expect(fetchMock.mock.calls[0][0]).toContain("/tv/popular");
        expect(result.results[0].media_type).toBe("tv");
        expect(result.totalPages).toBe(3);
    });

    it("searches TV and encodes the query", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { searchMedia } = await loadApi();

        await searchMedia("tv", "the office & co", 2);

        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain("/search/tv");
        expect(url).toContain("query=the%20office%20%26%20co");
        expect(url).toContain("page=2");
    });

    it("builds discover params for genre, sort, rating and years", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { discoverMedia } = await loadApi();

        await discoverMedia("movie", {
            genreId: 28,
            sortBy: "vote_average.desc",
            minRating: 7,
            yearFrom: 2010,
            yearTo: 2020,
            page: 2,
        });

        const url = fetchMock.mock.calls[0][0] as string;
        expect(url).toContain("/discover/movie");
        expect(url).toContain("with_genres=28");
        expect(url).toContain("sort_by=vote_average.desc");
        expect(url).toContain("vote_average.gte=7");
        expect(url).toContain("primary_release_date.gte=2010-01-01");
        expect(url).toContain("primary_release_date.lte=2020-12-31");
        expect(url).toContain("page=2");
    });

    it("uses first_air_date for TV year filters", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { discoverMedia } = await loadApi();

        await discoverMedia("tv", { yearFrom: 2015 });

        expect(fetchMock.mock.calls[0][0]).toContain("first_air_date.gte=2015-01-01");
    });

    it("caps total pages at TMDB's 500 page limit", async () => {
        mockFetchOnce({ ...listBody, total_pages: 9000 });
        const { getPopular } = await loadApi();

        const result = await getPopular("movie", 1);

        expect(result.totalPages).toBe(500);
    });

    it("caches identical requests", async () => {
        const fetchMock = mockFetchOnce(listBody);
        const { getPopular } = await loadApi();

        await getPopular("movie", 1);
        await getPopular("movie", 1);

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws a helpful error when TMDB responds with a failure", async () => {
        mockFetchOnce({}, false, 401);
        const { getPopular } = await loadApi();

        await expect(getPopular("movie", 1)).rejects.toThrow(/401/);
    });

    it("throws when no credentials are configured", async () => {
        vi.resetModules();
        vi.stubEnv("VITE_TMDB_READ_TOKEN", "");
        vi.stubEnv("VITE_TMDB_PROXY_URL", "");
        vi.stubEnv("VITE_TMDB_API_KEY", "");
        vi.stubGlobal("fetch", vi.fn());
        const { getPopular } = await import("./movieApi");

        await expect(getPopular("movie", 1)).rejects.toThrow(/credentials/i);
    });

    it("routes through the proxy when configured", async () => {
        vi.resetModules();
        vi.stubEnv("VITE_TMDB_PROXY_URL", "/api/tmdb");
        const fetchMock = mockFetchOnce(listBody);
        const { getPopular } = await import("./movieApi");

        await getPopular("movie", 1);

        expect(fetchMock.mock.calls[0][0]).toBe(
            "/api/tmdb?path=%2Fmovie%2Fpopular%3Fpage%3D1"
        );
    });
});
