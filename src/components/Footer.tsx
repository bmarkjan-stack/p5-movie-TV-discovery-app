export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <p>
                    This product uses the TMDB API but is not endorsed
                    or certified by TMDB.
                </p>

                <p className="footer-credit">
                    Movie data provided by{" "}
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TMDB
                    </a>
                    .
                </p>

            </div>
        </footer>
    );
}