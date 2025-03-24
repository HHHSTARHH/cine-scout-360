
import axios from 'axios';

const API_KEY = 'd29f95925fd802021a1957b7b04b7379';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image sizes available from TMDb
export const posterSizes = {
  small: `${IMAGE_BASE_URL}/w185`,
  medium: `${IMAGE_BASE_URL}/w342`,
  large: `${IMAGE_BASE_URL}/w500`,
  original: `${IMAGE_BASE_URL}/original`,
};

export const backdropSizes = {
  small: `${IMAGE_BASE_URL}/w300`,
  medium: `${IMAGE_BASE_URL}/w780`,
  large: `${IMAGE_BASE_URL}/w1280`,
  original: `${IMAGE_BASE_URL}/original`,
};

// Create axios instance with default configs
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

// API service functions
export const tmdbAPI = {
  // Get trending movies
  getTrending: async (timeWindow = 'day', page = 1) => {
    try {
      const response = await apiClient.get(`/trending/movie/${timeWindow}`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  },

  // Get movie details
  getMovieDetails: async (movieId: number) => {
    try {
      const response = await apiClient.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,similar,recommendations,keywords',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      throw error;
    }
  },

  // Search movies
  searchMovies: async (query: string, page = 1) => {
    try {
      const response = await apiClient.get('/search/movie', {
        params: { query, page, include_adult: false },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (genreId: number, page = 1) => {
    try {
      const response = await apiClient.get('/discover/movie', {
        params: {
          with_genres: genreId,
          page,
          sort_by: 'popularity.desc',
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching movies for genre ID ${genreId}:`, error);
      throw error;
    }
  },

  // Get movie genres list
  getGenres: async () => {
    try {
      const response = await apiClient.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // Get popular movies
  getPopular: async (page = 1) => {
    try {
      const response = await apiClient.get('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  // Get top rated movies
  getTopRated: async (page = 1) => {
    try {
      const response = await apiClient.get('/movie/top_rated', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
      throw error;
    }
  },

  // Get upcoming movies
  getUpcoming: async (page = 1) => {
    try {
      const response = await apiClient.get('/movie/upcoming', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
      throw error;
    }
  },
};

// Helper function to get full image URL
export const getImageUrl = (path: string | null, size = 'original') => {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export default tmdbAPI;
