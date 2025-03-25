
import { makeGeminiRequest } from './config';
import tmdbAPI from '../api';

export const movieChat = async (userMessage: string) => {
  try {
    // Try to get some relevant movie data based on the user message
    let contextData = '';
    
    // Check for movie mentions in the user message
    const potentialMovieTitles = userMessage.match(/(?:\b[A-Z][a-z]*\b\s*){1,5}/g) || [];
    
    if (potentialMovieTitles.length > 0) {
      try {
        for (const title of potentialMovieTitles) {
          if (title.trim().length > 3) { // Minimum length to avoid false positives
            const searchResults = await tmdbAPI.searchMovies(title.trim());
            if (searchResults.results.length > 0) {
              const movie = searchResults.results[0]; // Get the top match
              contextData += `\n\nAdditional context about "${movie.title}" (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}): ${movie.overview}\nPopularity score: ${movie.popularity.toFixed(1)}, Vote average: ${movie.vote_average.toFixed(1)}/10`;
            }
          }
        }
      } catch (searchError) {
        console.error('Error searching for movie context:', searchError);
      }
    }
    
    // Get trending movies for additional context
    try {
      const trending = await tmdbAPI.getTrending();
      contextData += '\n\nCurrent trending movies: ' + 
        trending.results.slice(0, 5).map(m => `${m.title} (${m.release_date ? new Date(m.release_date).getFullYear() : 'Unknown'})`).join(', ');
    } catch (trendingError) {
      console.error('Error getting trending movies for context:', trendingError);
    }
    
    const prompt = `USER QUESTION ABOUT MOVIES: ${userMessage}\n\n${contextData}\n\nRespond conversationally as a friendly, knowledgeable movie expert. If they're asking for recommendations, suggest specific titles. If they're asking about movie facts, provide accurate information. Keep your answer focused on movies and related topics.`;
    
    const aiResponse = await makeGeminiRequest(prompt);
    return aiResponse;
  } catch (error) {
    console.error('Error in movie chat:', error);
    
    // Fallback message with trending movies info
    try {
      const trending = await tmdbAPI.getTrending();
      const trendingList = trending.results.slice(0, 5)
        .map(m => `${m.title} (${m.release_date ? new Date(m.release_date).getFullYear() : 'Unknown'})`)
        .join(', ');
      
      return `I'm having trouble processing your request at the moment, but I can tell you that the current trending movies are: ${trendingList}. Feel free to ask me about any of these!`;
    } catch (fallbackError) {
      return "I'm having trouble connecting to the movie database at the moment. Please try again later!";
    }
  }
};
