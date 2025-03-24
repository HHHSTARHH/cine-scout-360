
import { getRecommendations, getEmotionBasedSuggestions } from './recommendations';
import { findMoviesByScene } from './sceneSearch';
import { movieChat } from './chat';

// Export all AI service functions
export const aiService = {
  getRecommendations,
  getEmotionBasedSuggestions,
  findMoviesByScene,
  movieChat
};

export default aiService;
