import { Link, NavLink } from "react-router-dom";

import { useFavorites } from "../context/useFavorites";

export default function Header() {
    const { favorites } = useFavorites();

    return (
        <header className="site-header">
            <div className="header-container">
                <Link
                    to="/"
                    className="logo"
                >
                    <span aria-hidden="true">🎬</span> Movie Finder
                </Link>

                <nav className="main-navigation" aria-label="Main">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/favorites"
                        className={({ isActive }) =>
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Favorites
                        <span className="favorite-count">
                            {favorites.length}
                        </span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}