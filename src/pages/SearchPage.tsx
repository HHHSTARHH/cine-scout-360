
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import AIRecommendations from '../components/AIRecommendations';
import tmdbAPI from '../services/api';
import { List, Grid, Filter, ArrowUpDown, Search } from 'lucide-react';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [yearFilter, setYearFilter] = useState('');
  const { toast } = useToast();
  
  // Extract query from URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    setSearchQuery(query || '');
    
    // Reset page when query changes
    setCurrentPage(1);
  }, [location.search]);
  
  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = await tmdbAPI.getGenres();
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Fetch movies based on search query
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let moviesData;
        
        if (searchQuery) {
          // Search by query
          moviesData = await tmdbAPI.searchMovies(searchQuery, currentPage);
        } else {
          // Show discover results with filters
          const params = {
            page: currentPage,
            sort_by: sortBy,
          };
          
          if (selectedGenres.length > 0) {
            params.with_genres = selectedGenres.join(',');
          }
          
          if (yearFilter) {
            const year = parseInt(yearFilter);
            if (!isNaN(year)) {
              params.primary_release_year = year;
            }
          }
          
          // Use discover endpoint for filtered results
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=d29f95925fd802021a1957b7b04b7379&language=en-US&page=${params.page}&sort_by=${params.sort_by}${
              params.with_genres ? `&with_genres=${params.with_genres}` : ''
            }${params.primary_release_year ? `&primary_release_year=${params.primary_release_year}` : ''}`
          );
          moviesData = await response.json();
        }
        
        setMovies(moviesData.results);
        setTotalPages(Math.min(moviesData.total_pages, 500)); // TMDb API limits to 500 pages
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast({
          title: "Error",
          description: "Failed to load movies. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [searchQuery, currentPage, sortBy, selectedGenres, yearFilter, toast]);
  
  // Toggle genre selection
  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i);
  
  // Handle sorting change
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Handle year filter change
  const handleYearChange = (value) => {
    setYearFilter(value);
    setCurrentPage(1); // Reset to first page when year changes
  };
  
  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen bg-tmdb-darker">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover Movies'}
          </h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar />
          </div>
          
          {/* Filters & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                  view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 ${
                  view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm">List</span>
              </button>
            </div>
            
            {/* Sort & Filter */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                  onClick={() => document.getElementById('sort-dropdown').classList.toggle('hidden')}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Sort</span>
                </button>
                <div id="sort-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-tmdb-gray/95 backdrop-blur-md rounded-lg shadow-xl z-10 py-1 animate-fade-in">
                  <button 
                    onClick={() => handleSortChange('popularity.desc')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${sortBy === 'popularity.desc' ? 'text-tmdb-red' : ''}`}
                  >
                    Most Popular
                  </button>
                  <button 
                    onClick={() => handleSortChange('vote_average.desc')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${sortBy === 'vote_average.desc' ? 'text-tmdb-red' : ''}`}
                  >
                    Highest Rated
                  </button>
                  <button 
                    onClick={() => handleSortChange('primary_release_date.desc')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${sortBy === 'primary_release_date.desc' ? 'text-tmdb-red' : ''}`}
                  >
                    Newest
                  </button>
                  <button 
                    onClick={() => handleSortChange('primary_release_date.asc')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${sortBy === 'primary_release_date.asc' ? 'text-tmdb-red' : ''}`}
                  >
                    Oldest
                  </button>
                </div>
              </div>
              
              {/* Filters Button */}
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-xl animate-fade-in">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Genres */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-300">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {genres.map(genre => (
                      <button
                        key={genre.id}
                        onClick={() => toggleGenre(genre.id)}
                        className={`pill text-sm ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-tmdb-red text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Year Filter */}
                <div>
                  <h4 className="text-sm font-medium mb-3 text-gray-300">Release Year</h4>
                  <select 
                    value={yearFilter}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full py-2 px-3 bg-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-tmdb-red/50"
                  >
                    <option value="">All Years</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedGenres([]);
                    setYearFilter('');
                    setSortBy('popularity.desc');
                  }}
                  className="px-4 py-2 text-sm hover:bg-white/10 rounded-lg mr-2"
                >
                  Reset Filters
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm bg-tmdb-red hover:bg-tmdb-red/90 rounded-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-pulse-slow">
                <svg className="w-12 h-12 text-tmdb-red" viewBox="0 0 24 24">
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
          ) : (
            <>
              {/* No Results */}
              {movies.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No results found</h2>
                  <p className="text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <p className="text-sm text-gray-400 mb-4">
                    Showing {movies.length} results {totalPages > 1 ? `(page ${currentPage} of ${totalPages})` : ''}
                  </p>
                  
                  {/* Grid View */}
                  {view === 'grid' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                      {movies.map(movie => (
                        <MovieCard
                          key={movie.id}
                          id={movie.id}
                          title={movie.title}
                          posterPath={movie.poster_path}
                          releaseDate={movie.release_date}
                          voteAverage={movie.vote_average}
                          size="medium"
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* List View */}
                  {view === 'list' && (
                    <div className="space-y-4">
                      {movies.map(movie => (
                        <div 
                          key={movie.id}
                          className="flex neo-card p-3 hover:scale-[1.01] transition-transform"
                        >
                          {/* Poster */}
                          <div className="w-20 h-30 flex-shrink-0">
                            {movie.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                alt={movie.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full bg-tmdb-gray rounded-md flex items-center justify-center">
                                <Film className="w-8 h-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div className="ml-4 flex-1">
                            <h3 className="font-bold">{movie.title}</h3>
                            
                            <div className="flex items-center mt-1 text-sm text-gray-400">
                              {movie.release_date && (
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                              )}
                              
                              {movie.vote_average > 0 && (
                                <div className="flex items-center ml-3">
                                  <Star className="w-3.5 h-3.5 text-yellow-400 mr-1" fill="currentColor" />
                                  <span>{movie.vote_average.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            
                            {movie.overview && (
                              <p className="mt-2 text-sm text-gray-300 line-clamp-2">{movie.overview}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            currentPage === 1
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          «
                        </button>
                        
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            currentPage === 1
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          ‹
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Create a window of page numbers centered around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={i}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                currentPage === pageNum
                                  ? 'bg-tmdb-red text-white'
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            currentPage === totalPages
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          ›
                        </button>
                        
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            currentPage === totalPages
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* AI Recommendations Component */}
      <AIRecommendations />
    </div>
  );
};

export default SearchPage;
