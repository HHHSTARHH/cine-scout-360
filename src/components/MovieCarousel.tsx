
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
}

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  size?: 'small' | 'medium' | 'large';
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ 
  title, 
  movies, 
  size = 'medium' 
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Calculate scroll width and update arrow visibility
  const updateArrowVisibility = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10); // Small buffer
  };
  
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateArrowVisibility);
      // Initial check
      updateArrowVisibility();
      
      return () => carousel.removeEventListener('scroll', updateArrowVisibility);
    }
  }, [movies]);
  
  // Scroll handlers
  const scrollLeft = () => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({ left: -width / 2, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    carouselRef.current.scrollBy({ left: width / 2, behavior: 'smooth' });
  };
  
  // Calculate gap size based on card size
  const gapSize = size === 'small' ? 'gap-3' : size === 'large' ? 'gap-6' : 'gap-4';
  
  return (
    <div className="relative py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      </div>
      
      {/* Carousel Container */}
      <div className="relative group">
        {/* Left Arrow */}
        <button 
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full 
            bg-black/60 text-white backdrop-blur-sm transition-all duration-300
            ${showLeftArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'}
            -ml-5 group-hover:ml-0`}
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Carousel Scroll Area */}
        <div 
          ref={carouselRef}
          className={`flex overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth ${gapSize}`}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0">
              <MovieCard 
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                releaseDate={movie.release_date}
                voteAverage={movie.vote_average}
                overview={movie.overview}
                size={size}
              />
            </div>
          ))}
        </div>
        
        {/* Right Arrow */}
        <button 
          onClick={scrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full 
            bg-black/60 text-white backdrop-blur-sm transition-all duration-300
            ${showRightArrow ? 'opacity-70 hover:opacity-100' : 'opacity-0 pointer-events-none'}
            -mr-5 group-hover:mr-0`}
        >
          <ChevronRight size={20} />
        </button>
        
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-tmdb-darker to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-tmdb-darker to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default MovieCarousel;
