import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { FavoritesProvider } from "./context/FavoritesProvider";

export default function App() {
    return (
        <BrowserRouter>
            <FavoritesProvider>
                <Header />

                <Routes>
                    <Route
                        path="/"
                        element={<HomePage />}
                    />

                    <Route
                        path="/movie/:movieId"
                        element={<MovieDetailsPage />}
                    />

                    <Route
                        path="/favorites"
                        element={<FavoritesPage />}
                    />

                    <Route
                        path="*"
                        element={<NotFoundPage />}
                    />
                </Routes>

                <Footer />
            </FavoritesProvider>
        </BrowserRouter>
    );
}