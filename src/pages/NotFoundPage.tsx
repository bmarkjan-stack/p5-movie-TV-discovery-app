import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <main className="not-found-page">
            <div>
                <div className="not-found-number">
                    404
                </div>
                <h1>Movie Not Found</h1>
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