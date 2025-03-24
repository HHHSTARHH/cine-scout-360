
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import MovieCarousel from '../components/MovieCarousel';
import AIRecommendations from '../components/AIRecommendations';
import tmdbAPI, { backdropSizes, posterSizes } from '../services/api';
import { Play, Star, Clock, Heart, Calendar, Film, User, Tag } from 'lucide-react';

const MoviePage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        if (!id) return;
        const movieData = await tmdbAPI.getMovieDetails(parseInt(id));
        setMovie(movieData);
        setIsLoading(false);
        
        // Scroll to top when movie changes
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        toast({
          title: "Error",
          description: "Failed to load movie details. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchMovieDetails();
  }, [id, toast]);
  
  // Format runtime
  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Loading state
  if (isLoading || !movie) {
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
      
      {/* Hero Banner */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        {/* Backdrop Image */}
        {movie.backdrop_path ? (
          <div className="absolute inset-0">
            <img 
              src={`${backdropSizes.original}${movie.backdrop_path}`} 
              alt={movie.title}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-overlay" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-tmdb-dark" />
        )}
        
        {/* Movie Info Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-16 md:pb-24 flex flex-col md:flex-row items-end md:items-center gap-8">
            {/* Poster */}
            {movie.poster_path && (
              <div className="hidden md:block w-64 rounded-xl overflow-hidden shadow-2xl transform translate-y-16">
                <img 
                  src={`${posterSizes.large}${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-auto"
                />
              </div>
            )}
            
            {/* Movie Details */}
            <div className="flex-1 md:pb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              
              {movie.tagline && (
                <p className="text-xl italic text-gray-300 mb-4">{movie.tagline}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {movie.vote_average && (
                  <div className="rating-circle bg-tmdb-red text-white">
                    {movie.vote_average.toFixed(1)}
                  </div>
                )}
                
                {movie.release_date && (
                  <span className="text-sm text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
                )}
                
                {movie.runtime && (
                  <span className="text-sm text-gray-300">{formatRuntime(movie.runtime)}</span>
                )}
                
                {movie.genres && movie.genres.map(genre => (
                  <span key={genre.id} className="pill bg-white/10 backdrop-blur-sm text-white">
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-tmdb-red rounded-lg font-medium hover:bg-tmdb-red/90 transition-colors">
                  <Play className="w-4 h-4" />
                  Trailer
                </button>
                
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                  <Heart className="w-4 h-4" />
                  Add to Watchlist
                </button>
                
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                  <Clock className="w-4 h-4" />
                  Watched
                </button>
              </div>
              
              <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-3xl">{movie.overview}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cast Section */}
            {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movie.credits.cast.slice(0, 10).map(person => (
                    <div key={person.id} className="neo-card p-2 text-center hover:scale-105 transition-transform">
                      {person.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                          alt={person.name}
                          className="w-full h-auto rounded-lg mb-2"
                        />
                      ) : (
                        <div className="bg-tmdb-gray rounded-lg flex items-center justify-center h-24 mb-2">
                          <User className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <h3 className="font-medium text-sm">{person.name}</h3>
                      <p className="text-xs text-gray-400">{person.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Videos Section */}
            {movie.videos && movie.videos.results && movie.videos.results.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movie.videos.results.slice(0, 4).map(video => (
                    <div key={video.id} className="neo-card overflow-hidden rounded-xl hover:shadow-lg transition-shadow">
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.key}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block relative aspect-video"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`} 
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-tmdb-red/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </a>
                      <div className="p-3">
                        <h3 className="font-medium">{video.name}</h3>
                        <p className="text-xs text-gray-400">{video.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="neo-card p-6 space-y-6">
              {/* Movie Facts */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Movie Facts</h3>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-tmdb-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Release Date</p>
                      <p>{formatDate(movie.release_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 mb-3">
                    <Film className="w-5 h-5 text-tmdb-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p>{movie.status}</p>
                    </div>
                  </div>
                  
                  {movie.budget > 0 && (
                    <div className="flex items-start gap-3 mb-3">
                      <Tag className="w-5 h-5 text-tmdb-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Budget</p>
                        <p>{formatCurrency(movie.budget)}</p>
                      </div>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div className="flex items-start gap-3 mb-3">
                      <Tag className="w-5 h-5 text-tmdb-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Revenue</p>
                        <p>{formatCurrency(movie.revenue)}</p>
                      </div>
                    </div>
                  )}
                  
                  {movie.production_companies && movie.production_companies.length > 0 && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-tmdb-red flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Production</p>
                        <p>{movie.production_companies.map(company => company.name).join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Keywords */}
              {movie.keywords && movie.keywords.keywords && movie.keywords.keywords.length > 0 && (
                <div className="space-y-4 border-t border-white/10 pt-6">
                  <h3 className="text-xl font-bold">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.keywords.keywords.map(keyword => (
                      <Link 
                        key={keyword.id}
                        to={`/search?keywords=${keyword.id}`}
                        className="pill bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {keyword.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Similar Movies */}
        {movie.similar && movie.similar.results && movie.similar.results.length > 0 && (
          <section className="mt-16">
            <MovieCarousel title="Similar Movies" movies={movie.similar.results} />
          </section>
        )}
        
        {/* Recommendations */}
        {movie.recommendations && movie.recommendations.results && movie.recommendations.results.length > 0 && (
          <section className="mt-16">
            <MovieCarousel title="Recommended Movies" movies={movie.recommendations.results} />
          </section>
        )}
      </main>
      
      {/* AI Recommendations Component */}
      <AIRecommendations />
    </div>
  );
};

export default MoviePage;
