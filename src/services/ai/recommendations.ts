
import { makeGeminiRequest, parseJsonFromResponse } from './config';

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
    
    if (params.prompt) {
      prompt = params.prompt;
    } else {
      if (params.genre) prompt += ` in the ${params.genre} genre`;
      if (params.mood) prompt += ` that are ${params.mood}`;
      if (params.era) prompt += ` from the ${params.era}`;
      if (params.actors && params.actors.length > 0) prompt += ` starring ${params.actors.join(' or ')}`;
      if (params.directors && params.directors.length > 0) prompt += ` directed by ${params.directors.join(' or ')}`;
      if (params.similarMovies && params.similarMovies.length > 0) {
        prompt += ` similar to ${params.similarMovies.join(', ')}`;
      }
    }
    
    prompt += '. For each movie, provide the title, year, director, a brief description, and why someone would enjoy it. Format as JSON with fields: title, year, director, description, and reason.';

    const textResponse = await makeGeminiRequest(prompt);
    const recommendations = parseJsonFromResponse(textResponse);
    
    return Array.isArray(recommendations) 
      ? recommendations 
      : recommendations.recommendations || recommendations.movies || [];
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw error;
  }
};

export const getEmotionBasedSuggestions = async (emotion: string) => {
  try {
    const prompt = `I'm feeling ${emotion}. Recommend 5 movies that would be perfect to watch when feeling this way. For each movie, provide the title, year, a brief description, and why it's good for this emotion. Format as JSON with fields: title, year, description, and emotionReason.`;
    
    const textResponse = await makeGeminiRequest(prompt);
    const suggestions = parseJsonFromResponse(textResponse);
    
    return Array.isArray(suggestions) 
      ? suggestions 
      : suggestions.movies || suggestions.suggestions || [];
  } catch (error) {
    console.error('Error getting emotion-based suggestions:', error);
    throw error;
  }
};
