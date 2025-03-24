
import axios from 'axios';

// API key and URL constants
export const GEMINI_API_KEY = 'AIzaSyAp_yEr9tolye093YPK934q8rTn6E2uMKY';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Create axios instance with the correct base URL and configuration
export const aiClient = axios.create({
  baseURL: GEMINI_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: GEMINI_API_KEY,
  },
});

// Common function to make Gemini API requests
export const makeGeminiRequest = async (prompt: string) => {
  try {
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

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error making Gemini API request:', error);
    throw error;
  }
};

// Helper function to parse JSON from AI responses
export const parseJsonFromResponse = (textResponse: string) => {
  const jsonMatch = textResponse.match(/```json([\s\S]*?)```/) || 
                    textResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
  
  if (jsonMatch) {
    try {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return [];
    }
  } else {
    console.error('Could not extract JSON from AI response');
    return [];
  }
};
