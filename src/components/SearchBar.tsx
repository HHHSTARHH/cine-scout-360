
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import tmdbAPI from '../services/api';

interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
}

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        tmdbAPI.searchMovies(query)
          .then(data => {
            setResults(data.results.slice(0, 5));
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Search error:', error);
            setIsLoading(false);
          });
      } else {
        setResults([]);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [query]);
  
  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
    }
  };
  
  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className={`flex items-center w-full rounded-full transition-all duration-300 ${isFocused ? 'bg-white/10 ring-2 ring-tmdb-red/50' : 'bg-white/5'}`}>
          <Search className={`w-5 h-5 mx-4 transition-colors ${isFocused ? 'text-tmdb-red' : 'text-gray-400'}`} />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search for movies, TV shows, or people..."
            className="w-full py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mx-2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          <button
            type="submit"
            className="hidden sm:block py-2 px-4 mx-2 bg-tmdb-red text-white rounded-full hover:bg-tmdb-red/90 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Search results dropdown */}
      {isFocused && (query.length >= 2 || results.length > 0) && (
        <div className="absolute mt-2 w-full bg-tmdb-gray/95 backdrop-blur-md rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div>
              <div className="p-3 border-b border-white/10">
                <span className="text-xs text-gray-400">RESULTS FOR "{query}"</span>
              </div>
              <ul>
                {results.map(movie => (
                  <li key={movie.id} className="border-b border-white/10 last:border-0">
                    <button
                      onClick={() => {
                        navigate(`/movie/${movie.id}`);
                        setIsFocused(false);
                      }}
                      className="flex items-center gap-3 p-3 w-full text-left hover:bg-white/5 transition-colors"
                    >
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                          alt={movie.title}
                          className="w-10 h-15 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-15 bg-tmdb-dark rounded flex items-center justify-center">
                          <Film className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{movie.title}</div>
                        {movie.release_date && (
                          <div className="text-sm text-gray-400">
                            {new Date(movie.release_date).getFullYear()}
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-3 text-center border-t border-white/10">
                <button
                  onClick={() => handleSearch()}
                  className="text-sm text-tmdb-red hover:underline"
                >
                  See all results
                </button>
              </div>
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
