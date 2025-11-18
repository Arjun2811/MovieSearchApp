import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// ---- TMDB FETCH HELPER ----
const fetchTMDB = async (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}&api_key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("Failed to fetch TMDB data");

  return await response.json();
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [trendingErrorMsg, setTrendingErrorMsg] = useState(null);

  // Debounce for search
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm]);

  // ---- SEARCH / DISCOVER MOVIES ----
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // FIXED URL FORMAT — correct TMDB syntax
      const endpoint = query
        ? `/search/movie?query=${encodeURIComponent(query)}`
        : `/discover/movie?sort_by=popularity.desc`;

      const data = await fetchTMDB(endpoint);
      setMovieList(data.results || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setErrorMessage("Error fetching movies.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- TRENDING MOVIES ----
  const loadTrendingMovies = async () => {
    setIsLoadingTrending(true);
    setTrendingErrorMsg("");

    try {
      const data = await fetchTMDB(`/trending/movie/week?`);
      setTrendingMovies(data.results || []);
    } catch (err) {
      console.error("Error fetching trending movies:", err);
      setTrendingErrorMsg("Error fetching trending movies!");
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
            Find <span className="text-gradient">Movies</span> You will Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* TRENDING MOVIES */}
        <section className="trending">
          <h2>Trending Movies</h2>

          {isLoadingTrending ? (
            <Spinner />
          ) : trendingErrorMsg ? (
            <p className="text-red-500">{trendingErrorMsg}</p>
          ) : trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.slice(0, 5).map((movie, index) => (
                <li key={movie.id}>
                  <p>{index + 1}</p>
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                        : "No-Poster.png"
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

        {/* ALL MOVIES */}
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
