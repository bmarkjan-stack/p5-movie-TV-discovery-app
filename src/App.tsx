import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import DetailsPage from "./pages/DetailsPage";
import FavoritesPage from "./pages/FavoritesPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import { FavoritesProvider } from "./context/FavoritesProvider";

export default function App() {
    return (
        <BrowserRouter>
            <FavoritesProvider>
                <a href="#main-content" className="skip-link">
                    Skip to content
                </a>

                <Header />

                <div id="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movie/:id" element={<DetailsPage mediaType="movie" />} />
                        <Route path="/tv/:id" element={<DetailsPage mediaType="tv" />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>

                <Footer />
            </FavoritesProvider>
        </BrowserRouter>
    );
}
