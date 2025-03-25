import { makeGeminiRequest, parseJsonFromResponse } from './config';
import tmdbAPI from '../api';

// Type definitions
export interface RecommendationParams {
  genre?: string;
  mood?: string;
  actors?: string[];
  directors?: string[];
  similarMovies?: string[];
  era?: string;
  prompt?: string;
}

export const getRecommendations = async (params: RecommendationParams) => {
  try {
    let prompt = 'Recommend 5 movies';
    let tmdbResults = [];
    
    if (params.prompt) {
      prompt = params.prompt;
      // Try to extract potential search terms for TMDB
      const searchTerm = params.prompt.replace(/recommend|movies|like|similar|to/gi, '').trim();
      if (searchTerm.length > 3) {
        const searchResults = await tmdbAPI.searchMovies(searchTerm);
        tmdbResults = searchResults.results.slice(0, 5);
      }
    } else {
      if (params.genre) {
        prompt += ` in the ${params.genre} genre`;
        // Get movies by genre if genre specified
        try {
          const genres = await tmdbAPI.getGenres();
          const genreId = genres.find(g => g.name.toLowerCase() === params.genre.toLowerCase())?.id;
          if (genreId) {
            const genreResults = await tmdbAPI.getMoviesByGenre(genreId);
            tmdbResults = genreResults.results.slice(0, 5);
          }
        } catch (error) {
          console.error('Error fetching genre movies:', error);
        }
      }
      if (params.mood) prompt += ` that are ${params.mood}`;
      if (params.era) prompt += ` from the ${params.era}`;
      if (params.actors && params.actors.length > 0) prompt += ` starring ${params.actors.join(' or ')}`;
      if (params.directors && params.directors.length > 0) prompt += ` directed by ${params.directors.join(' or ')}`;
      if (params.similarMovies && params.similarMovies.length > 0) {
        prompt += ` similar to ${params.similarMovies.join(', ')}`;
        // Try to get TMDB recommendations for the first similar movie
        try {
          const searchResults = await tmdbAPI.searchMovies(params.similarMovies[0]);
          if (searchResults.results.length > 0) {
            const movieId = searchResults.results[0].id;
            const movieDetails = await tmdbAPI.getMovieDetails(movieId);
            if (movieDetails.recommendations && movieDetails.recommendations.results) {
              tmdbResults = movieDetails.recommendations.results.slice(0, 5);
            }
          }
        } catch (error) {
          console.error('Error fetching similar movies:', error);
        }
      }
    }
    
    prompt += '. For each movie, provide the title, year, director, a brief description, and why someone would enjoy it. Format as JSON with fields: title, year, director, description, and reason.';

    // If we have TMDB results, use them to construct a response
    if (tmdbResults.length > 0) {
      const aiEnhancedResults = tmdbResults.map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        director: 'Unknown', // TMDB doesn't return director in basic search
        description: movie.overview,
        reason: `This movie has a popularity score of ${movie.popularity.toFixed(1)} and a vote average of ${movie.vote_average.toFixed(1)}/10.`,
        poster_path: movie.poster_path,
        id: movie.id
      }));
      
      // Send to Gemini for enrichment if possible
      try {
        const jsonString = JSON.stringify(aiEnhancedResults);
        const enrichmentPrompt = `Enhance these movie recommendations with more detailed and personalized reasons why someone would enjoy these films. Don't change the titles or other factual information: ${jsonString}`;
        
        const textResponse = await makeGeminiRequest(enrichmentPrompt);
        const parsedResponse = parseJsonFromResponse(textResponse);
        
        if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
          return parsedResponse;
        }
      } catch (enrichError) {
        console.error('Error enriching with Gemini, using TMDB data directly:', enrichError);
      }
      
      return aiEnhancedResults;
    }

    // Fallback to pure Gemini if no TMDB results
    const textResponse = await makeGeminiRequest(prompt);
    const recommendations = parseJsonFromResponse(textResponse);
    
    return Array.isArray(recommendations) 
      ? recommendations 
      : recommendations.recommendations || recommendations.movies || [];
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    
    // Fallback to trending movies if all else fails
    try {
      const trending = await tmdbAPI.getTrending();
      return trending.results.slice(0, 5).map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        director: 'Unknown',
        description: movie.overview,
        reason: `This is a trending movie with a popularity score of ${movie.popularity.toFixed(1)}.`,
        poster_path: movie.poster_path,
        id: movie.id
      }));
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return [];
    }
  }
};

export const getEmotionBasedSuggestions = async (emotion: string) => {
  try {
    const prompt = `I'm feeling ${emotion}. Recommend 5 movies that would be perfect to watch when feeling this way. For each movie, provide the title, year, a brief description, and why it's good for this emotion. Format as JSON with fields: title, year, description, and emotionReason.`;
    
    // Try to get trending or popular movies from TMDB as a backup
    let tmdbResults = [];
    try {
      const popular = await tmdbAPI.getPopular();
      tmdbResults = popular.results.slice(0, 5);
    } catch (err) {
      console.error('Error fetching TMDB popular movies:', err);
    }
    
    const textResponse = await makeGeminiRequest(prompt);
    const suggestions = parseJsonFromResponse(textResponse);
    
    const results = Array.isArray(suggestions) 
      ? suggestions 
      : suggestions.movies || suggestions.suggestions || [];
    
    // If Gemini returned valid results, use those
    if (results.length > 0) {
      return results;
    }
    
    // Otherwise use TMDB results with emotion context
    if (tmdbResults.length > 0) {
      return tmdbResults.map(movie => ({
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
        description: movie.overview,
        emotionReason: `This popular movie might help when feeling ${emotion}.`,
        poster_path: movie.poster_path,
        id: movie.id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting emotion-based suggestions:', error);
    throw error;
  }
};
