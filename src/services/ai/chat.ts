
import { makeGeminiRequest } from './config';

export const movieChat = async (userMessage: string) => {
  try {
    const prompt = `USER QUESTION ABOUT MOVIES: ${userMessage}\n\nRespond conversationally as a friendly, knowledgeable movie expert. If they're asking for recommendations, suggest specific titles. If they're asking about movie facts, provide accurate information. Keep your answer focused on movies and related topics.`;
    
    const aiResponse = await makeGeminiRequest(prompt);
    return aiResponse;
  } catch (error) {
    console.error('Error in movie chat:', error);
    throw error;
  }
};
