
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { Search, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-tmdb-darker flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full px-6 py-12 text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-tmdb-red/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-tmdb-red/30 animate-pulse delay-150"></div>
            <div className="absolute inset-4 rounded-full bg-tmdb-red/40 animate-pulse delay-300"></div>
            <div className="absolute inset-6 rounded-full bg-tmdb-red/50 animate-pulse delay-500"></div>
            <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold">404</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-tmdb-red rounded-lg font-medium hover:bg-tmdb-red/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            
            <Link
              to="/search"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              <Search className="w-5 h-5" />
              Search Movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
