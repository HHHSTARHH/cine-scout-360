
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Film, User, List } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen 
          ? 'bg-tmdb-darker/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-gradient-to-b from-tmdb-darker/90 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center space-x-2">
          <Film className="text-tmdb-red h-7 w-7" />
          <span className="text-xl font-bold tracking-tight">CineScout</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-medium hover:text-tmdb-red transition-colors">
            Home
          </Link>
          <Link to="/discover" className="text-sm font-medium hover:text-tmdb-red transition-colors">
            Discover
          </Link>
          <Link to="/trending" className="text-sm font-medium hover:text-tmdb-red transition-colors">
            Trending
          </Link>
          <Link to="/search" className="text-sm font-medium hover:text-tmdb-red transition-colors">
            Search
          </Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <Link to="/search" className="rounded-full p-2 hover:bg-white/5 transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/watchlist" className="rounded-full p-2 hover:bg-white/5 transition-colors">
            <List className="h-5 w-5" />
          </Link>
          <Link to="/profile" className="rounded-full p-2 hover:bg-white/5 transition-colors">
            <User className="h-5 w-5" />
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden rounded-full p-2 hover:bg-white/5" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-5 space-y-1">
              <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-full'}`}></span>
              <span className={`block h-0.5 w-full bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="container mx-auto px-4 flex flex-col space-y-4">
          <Link to="/" className="px-4 py-2 hover:bg-white/5 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/discover" className="px-4 py-2 hover:bg-white/5 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Discover
          </Link>
          <Link to="/trending" className="px-4 py-2 hover:bg-white/5 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Trending
          </Link>
          <Link to="/search" className="px-4 py-2 hover:bg-white/5 rounded-md transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
