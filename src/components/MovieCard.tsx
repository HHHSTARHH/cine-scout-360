
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Clock, Heart } from 'lucide-react';
import { posterSizes } from '../services/api';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate?: string;
  voteAverage?: number;
  overview?: string;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterPath,
  releaseDate,
  voteAverage,
  overview,
  size = 'medium'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Format the release date
  const formattedDate = releaseDate 
    ? new Date(releaseDate).getFullYear() 
    : '';

  // Generate the poster URL
  const posterUrl = posterPath 
    ? `${size === 'small' ? posterSizes.small : size === 'large' ? posterSizes.large : posterSizes.medium}${posterPath}`
    : '/placeholder.svg';
  
  // Determine the card size classes
  const sizeClasses = {
    small: 'w-36 h-60',
    medium: 'w-48 h-72',
    large: 'w-64 h-96'
  };
  
  // Rating background color based on vote average
  const getRatingColor = (rating: number = 0) => {
    if (rating >= 7.5) return 'bg-green-500';
    if (rating >= 6) return 'bg-yellow-500';
    if (rating >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <Link
      to={`/movie/${id}`}
      className={`movie-card relative ${sizeClasses[size]} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer effect while loading */}
      <div className={`absolute inset-0 bg-tmdb-gray shimmer rounded-xl ${imageLoaded ? 'hidden' : 'block'}`}></div>
      
      {/* Movie Poster */}
      <img 
        src={posterUrl} 
        alt={title}
        className={`w-full h-full object-cover rounded-xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Overlay on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-xl 
          ${isHovered ? 'opacity-100' : 'opacity-0'} 
          transition-opacity duration-300 p-4 flex flex-col justify-end`}
      >
        <h3 className="text-white font-bold line-clamp-2 text-sm sm:text-base">{title}</h3>
        {formattedDate && (
          <span className="text-gray-300 text-xs">{formattedDate}</span>
        )}
        
        {voteAverage !== undefined && (
          <div className="flex items-center space-x-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            <span className="text-xs font-medium">{voteAverage.toFixed(1)}</span>
          </div>
        )}
        
        {overview && size === 'large' && (
          <p className="mt-2 text-xs text-gray-300 line-clamp-3">{overview}</p>
        )}
        
        {/* Action buttons on hover */}
        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="rounded-full bg-tmdb-red/90 p-1.5 hover:bg-tmdb-red transition-colors">
            <Play className="w-3 h-3" />
          </button>
          <button className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors">
            <Heart className="w-3 h-3" />
          </button>
          <button className="rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors">
            <Clock className="w-3 h-3" />
          </button>
        </div>
        
        {/* Rating badge */}
        {voteAverage !== undefined && (
          <div className={`absolute top-2 left-2 ${getRatingColor(voteAverage)} rounded-md px-1.5 py-0.5 text-xs font-bold`}>
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MovieCard;
