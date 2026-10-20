import { Link } from "react-router-dom";

import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function NotFoundPage() {
    useDocumentMeta("Page not found");

    return (
        <main className="not-found-page">
            <div>
                <div className="not-found-number">
                    404
                </div>
                <h1>Page Not Found</h1>
                <p>
                    The page you're looking for doesn't exist.
                </p>

                <Link
                    to="/"
                    className="primary-button"
                >
                    Back to Movie Finder
                </Link>
            </div>
        </main>
    );
}