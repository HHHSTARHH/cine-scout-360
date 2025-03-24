
import { makeGeminiRequest, parseJsonFromResponse } from './config';

export const findMoviesByScene = async (sceneDescription: string) => {
  try {
    const prompt = `Find movies that have a scene matching this description: "${sceneDescription}". For each matching movie, provide the title, year, a brief description of the scene, and how it relates to the movie as a whole. Format as JSON with fields: title, year, sceneDescription, and movieContext.`;
    
    const textResponse = await makeGeminiRequest(prompt);
    const movieMatches = parseJsonFromResponse(textResponse);
    
    return Array.isArray(movieMatches) 
      ? movieMatches 
      : movieMatches.movies || movieMatches.matches || [];
  } catch (error) {
    console.error('Error searching for movies by scene:', error);
    throw error;
  }
};
