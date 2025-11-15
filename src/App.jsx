import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { updateSearchCount, getTrendingMovies } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [errorMessage, setErrorMessage] = useState(null);
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trendingErrorMsg, setTrendingErrorMsg] = useState(null);
    const [isLoadingTrending, setIsLoadingTrending] = useState(false);

    //Debounce the search term to prevent making too many api calls
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm]);

    const fetchMovies = async (query = "") => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
                      query
                  )}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error("Failed to fetch movies");
            }

            const data = await response.json();

            if (data.Response === "False") {
                setErrorMessage(data.error || "Failed to fetch movies");
                setMovieList([]);
                return;
            }
            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (err) {
            console.log(`Error fetching movies: ${err}`);
            setErrorMessage("Error fetching movies please try again later");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        setIsLoadingTrending(true);
        setTrendingErrorMsg("");

        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (err) {
            console.log("Error fetching trending movies", err);
            setTrendingErrorMsg("Error fetching tredning Movies!");
        } finally {
            setIsLoadingTrending(false);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern" />
            <div className="wrapper">
                <header>
                    <img src="./hero-img.png" alt="Hero Banner" />
                    <h1>
                        Find <span className="text-gradient">Movies</span> You
                        will Enjoy Without the Hassle
                    </h1>
                    <Search
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </header>

                <section className="trending">
                    <h2>Trending Movies</h2>

                    {isLoadingTrending ? (
                        <Spinner />
                    ) : trendingErrorMsg ? (
                        <p className="text-red-500">{trendingErrorMsg}</p>
                    ) : trendingMovies.length > 0 ? (
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img
                                        src={
                                            movie.poster_url || "No-Poster.png"
                                        }
                                        alt={movie.title}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No trending movies found.</p>
                    )}
                </section>

                <section className="all-movies">
                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
};

export default App;
