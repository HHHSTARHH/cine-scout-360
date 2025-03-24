
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { backdropSizes } from '../services/api';

interface HeroProps {
  movie: {
    id: number;
    title: string;
    backdrop_path: string | null;
    overview: string;
    vote_average?: number;
    release_date?: string;
    genres?: { id: number; name: string }[];
    runtime?: number;
  };
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Backdrop URL
  const backdropUrl = movie.backdrop_path 
    ? `${backdropSizes.large}${movie.backdrop_path}`
    : null;
    
  // Year from release date
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : '';
    
  // For animation on load
  useEffect(() => {
    if (backdropUrl) {
      const img = new Image();
      img.src = backdropUrl;
      img.onload = () => setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
  }, [backdropUrl]);
  
  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Backdrop */}
      {backdropUrl ? (
        <div className="absolute inset-0">
          <img 
            src={backdropUrl} 
            alt={movie.title}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isLoaded ? 'opacity-60' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-tmdb-darker" />
      )}
      
      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24">
        <div className={`max-w-3xl transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-white">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {movie.vote_average && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                <span className="text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            
            {releaseYear && (
              <span className="text-sm text-gray-300">{releaseYear}</span>
            )}
            
            {movie.runtime && (
              <span className="text-sm text-gray-300">{formatRuntime(movie.runtime)}</span>
            )}
            
            {movie.genres && movie.genres.slice(0, 3).map(genre => (
              <span key={genre.id} className="pill bg-white/10 backdrop-blur-sm text-white">
                {genre.name}
              </span>
            ))}
          </div>
          
          <p className="text-base md:text-lg text-gray-200 mb-6 line-clamp-3 md:line-clamp-4">{movie.overview}</p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-tmdb-red rounded-lg font-medium hover:bg-tmdb-red/90 transition-colors"
            >
              <Play className="w-5 h-5" />
              Watch Trailer
            </Link>
            
            <Link
              to={`/movie/${movie.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
