/**
 * Vercel serverless function that proxies requests to TMDB.
 *
 * Your TMDB token lives in a server-side env var (TMDB_READ_TOKEN, no VITE_
 * prefix) so it is never bundled into the browser code.
 *
 * Usage from the client:  GET /api/tmdb?path=%2Fmovie%2Fpopular%3Fpage%3D1
 *
 * Netlify? Move this to netlify/functions/tmdb.ts and adapt the handler
 * signature: exports.handler = async (event) => ({ statusCode, body }).
 */

interface ProxyRequest {
    method?: string;
    query: Record<string, string | string[] | undefined>;
}

interface ProxyResponse {
    status: (code: number) => ProxyResponse;
    setHeader: (name: string, value: string) => void;
    json: (body: unknown) => void;
}

// Only allow the read-only endpoints the app actually uses.
const ALLOWED_PATHS = [
    /^\/(movie|tv)\/popular$/,
    /^\/(movie|tv)\/\d+$/,
    /^\/search\/(movie|tv)$/,
    /^\/discover\/(movie|tv)$/,
    /^\/genre\/(movie|tv)\/list$/,
];

export default async function handler(req: ProxyRequest, res: ProxyResponse) {
    if (req.method && req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const rawPath = Array.isArray(req.query.path)
        ? req.query.path[0]
        : req.query.path;

    if (!rawPath || !rawPath.startsWith("/")) {
        return res.status(400).json({ error: "Missing or invalid `path`" });
    }

    const [pathname] = rawPath.split("?");

    if (!ALLOWED_PATHS.some((pattern) => pattern.test(pathname))) {
        return res.status(403).json({ error: "Endpoint not allowed" });
    }

    const token = process.env.TMDB_READ_TOKEN;

    if (!token) {
        return res
            .status(500)
            .json({ error: "TMDB_READ_TOKEN is not set on the server" });
    }

    try {
        const upstream = await fetch(`https://api.themoviedb.org/3${rawPath}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await upstream.json();

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=300, stale-while-revalidate=600"
        );

        return res.status(upstream.status).json(data);
    } catch {
        return res.status(502).json({ error: "Failed to reach TMDB" });
    }
}
