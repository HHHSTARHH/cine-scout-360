
// This service will handle AI recommendations using the Gemini API
import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyAp_yEr9tolye093YPK934q8rTn6E2uMKY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Type definitions
interface RecommendationParams {
  genre?: string;
  mood?: string;
  actors?: string[];
  directors?: string[];
  similarMovies?: string[];
  era?: string;
  prompt?: string;
}

// Create axios instance with the correct base URL and configuration
const aiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: GEMINI_API_KEY,
  },
});

export const aiService = {
  // Get movie recommendations based on parameters
  getRecommendations: async (params: RecommendationParams) => {
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

      // Using the correct endpoint and request structure for Gemini API
      const response = await aiClient.post('/models/gemini-pro:generateContent', {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const textResponse = response.data.candidates[0].content.parts[0].text;
      // Extract JSON from response
      const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || 
                        textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const recommendations = JSON.parse(jsonStr);
          return Array.isArray(recommendations) 
            ? recommendations 
            : recommendations.recommendations || recommendations.movies || [];
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
          return [];
        }
      } else {
        console.error('Could not extract JSON from AI response');
        return [];
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      throw error;
    }
  },

  // Get emotion-based movie suggestions
  getEmotionBasedSuggestions: async (emotion: string) => {
    try {
      const prompt = `I'm feeling ${emotion}. Recommend 5 movies that would be perfect to watch when feeling this way. For each movie, provide the title, year, a brief description, and why it's good for this emotion. Format as JSON with fields: title, year, description, and emotionReason.`;
      
      // Using the correct endpoint structure
      const response = await aiClient.post('/models/gemini-pro:generateContent', {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const textResponse = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || 
                        textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const suggestions = JSON.parse(jsonStr);
          return Array.isArray(suggestions) 
            ? suggestions 
            : suggestions.movies || suggestions.suggestions || [];
        } catch (parseError) {
          console.error('Error parsing AI emotion response:', parseError);
          return [];
        }
      } else {
        console.error('Could not extract JSON from AI emotion response');
        return [];
      }
    } catch (error) {
      console.error('Error getting emotion-based suggestions:', error);
      throw error;
    }
  },

  // Scene search - find movies by scene description
  findMoviesByScene: async (sceneDescription: string) => {
    try {
      const prompt = `Find movies that have a scene matching this description: "${sceneDescription}". For each matching movie, provide the title, year, a brief description of the scene, and how it relates to the movie as a whole. Format as JSON with fields: title, year, sceneDescription, and movieContext.`;
      
      // Using the correct endpoint structure
      const response = await aiClient.post('/models/gemini-pro:generateContent', {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const textResponse = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || 
                        textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const movieMatches = JSON.parse(jsonStr);
          return Array.isArray(movieMatches) 
            ? movieMatches 
            : movieMatches.movies || movieMatches.matches || [];
        } catch (parseError) {
          console.error('Error parsing AI scene search response:', parseError);
          return [];
        }
      } else {
        console.error('Could not extract JSON from AI scene search response');
        return [];
      }
    } catch (error) {
      console.error('Error searching for movies by scene:', error);
      throw error;
    }
  },

  // Chat with AI about movies
  movieChat: async (userMessage: string) => {
    try {
      const prompt = `USER QUESTION ABOUT MOVIES: ${userMessage}\n\nRespond conversationally as a friendly, knowledgeable movie expert. If they're asking for recommendations, suggest specific titles. If they're asking about movie facts, provide accurate information. Keep your answer focused on movies and related topics.`;
      
      // Using the correct endpoint structure
      const response = await aiClient.post('/models/gemini-pro:generateContent', {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      return aiResponse;
    } catch (error) {
      console.error('Error in movie chat:', error);
      throw error;
    }
  }
};

export default aiService;
