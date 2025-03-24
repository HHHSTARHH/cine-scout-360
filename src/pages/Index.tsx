
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MovieCarousel from '../components/MovieCarousel';
import SearchBar from '../components/SearchBar';
import AIRecommendations from '../components/AIRecommendations';
import tmdbAPI from '../services/api';

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [genreMovies, setGenreMovies] = useState({});
  const [genres, setGenres] = useState([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch trending movies
        const trendingData = await tmdbAPI.getTrending();
        setTrendingMovies(trendingData.results);
        
        // Set featured movie from trending
        if (trendingData.results && trendingData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(5, trendingData.results.length));
          const movieDetails = await tmdbAPI.getMovieDetails(trendingData.results[randomIndex].id);
          setFeaturedMovie(movieDetails);
        }
        
        // Fetch other movie categories in parallel
        const [popularData, topRatedData, upcomingData, genresData] = await Promise.all([
          tmdbAPI.getPopular(),
          tmdbAPI.getTopRated(),
          tmdbAPI.getUpcoming(),
          tmdbAPI.getGenres()
        ]);
        
        setPopularMovies(popularData.results);
        setTopRatedMovies(topRatedData.results);
        setUpcomingMovies(upcomingData.results);
        setGenres(genresData);
        
        // Fetch movies for top 3 genres
        const topGenres = genresData.slice(0, 3);
        const genreMoviesData = {};
        
        await Promise.all(
          topGenres.map(async (genre) => {
            const data = await tmdbAPI.getMoviesByGenre(genre.id);
            genreMoviesData[genre.id] = data.results;
          })
        );
        
        setGenreMovies(genreMoviesData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load movies. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Loading state
  if (isLoading || !featuredMovie) {
    return (
      <div className="min-h-screen bg-tmdb-darker">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse-slow">
            <svg className="w-16 h-16 text-tmdb-red" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                opacity=".5"
              />
              <path
                fill="currentColor"
                d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
              >
                <animateTransform
                  attributeName="transform"
                  dur="1s"
                  from="0 12 12"
                  repeatCount="indefinite"
                  to="360 12 12"
                  type="rotate"
                />
              </path>
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-tmdb-darker">
      <Navbar />
      
      {/* Hero Section */}
      <Hero movie={featuredMovie} />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 -mt-24 relative z-10">
        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar />
        </div>
        
        {/* Movie Carousels */}
        <section className="space-y-8">
          {/* Trending Movies */}
          <MovieCarousel title="Trending Now" movies={trendingMovies} />
          
          {/* Popular Movies */}
          <MovieCarousel title="Popular Movies" movies={popularMovies} />
          
          {/* Top Rated Movies */}
          <MovieCarousel title="Top Rated" movies={topRatedMovies} />
          
          {/* Upcoming Movies */}
          <MovieCarousel title="Coming Soon" movies={upcomingMovies} />
          
          {/* Genre-based Movies */}
          {genres.slice(0, 3).map(genre => 
            genreMovies[genre.id] && (
              <MovieCarousel 
                key={genre.id}
                title={genre.name} 
                movies={genreMovies[genre.id]} 
              />
            )
          )}
        </section>
      </main>
      
      {/* AI Recommendations Component */}
      <AIRecommendations />
    </div>
  );
};

export default Index;
