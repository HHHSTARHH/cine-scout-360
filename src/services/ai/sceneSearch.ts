
import { makeGeminiRequest, parseJsonFromResponse } from './config';
import tmdbAPI from '../api';

export const findMoviesByScene = async (sceneDescription: string) => {
  try {
    // Try to search for keywords in the TMDB database
    const keywords = sceneDescription.split(/\s+/).filter(word => word.length > 4);
    let tmdbResults = [];
    
    if (keywords.length > 0) {
      // Use the scene description as a search query
      try {
        const searchResults = await tmdbAPI.searchMovies(sceneDescription);
        tmdbResults = searchResults.results.slice(0, 5);
      } catch (searchError) {
        console.error('Error searching TMDB for scene:', searchError);
      }
    }
    
    const prompt = `Find movies that have a scene matching this description: "${sceneDescription}". For each matching movie, provide the title, year, a brief description of the scene, and how it relates to the movie as a whole. Format as JSON with fields: title, year, sceneDescription, and movieContext.`;
    
    const textResponse = await makeGeminiRequest(prompt);
    const movieMatches = parseJsonFromResponse(textResponse);
    
    // If we have a valid response from Gemini, use it
    if (Array.isArray(movieMatches) && movieMatches.length > 0) {
      return movieMatches;
    }
    
    // If we have TMDB results, format them appropriately
    if (tmdbResults.length > 0) {
      return tmdbResults.map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        sceneDescription: `This movie might contain scenes related to "${sceneDescription}"`,
        movieContext: movie.overview,
        poster_path: movie.poster_path,
        id: movie.id
      }));
    }
    
    return Array.isArray(movieMatches) 
      ? movieMatches 
      : movieMatches.movies || movieMatches.matches || [];
  } catch (error) {
    console.error('Error searching for movies by scene:', error);
    
    // Return a fallback message or empty array
    try {
      const popular = await tmdbAPI.getPopular();
      return popular.results.slice(0, 3).map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        sceneDescription: `This is a popular movie that might be of interest`,
        movieContext: movie.overview,
        poster_path: movie.poster_path,
        id: movie.id
      }));
    } catch (fallbackError) {
      return [];
    }
  }
};
