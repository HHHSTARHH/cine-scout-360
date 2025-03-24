
import { useState } from 'react';
import { Send, X } from 'lucide-react';
import aiService from '../services/ai';
import MovieCard from './MovieCard';

interface AIRecommendation {
  title: string;
  year: string | number;
  director?: string;
  description?: string;
  reason?: string;
  poster_path?: string | null;
  id?: number;
}

const AIRecommendations = () => {
  const [prompt, setPrompt] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const userPrompt = prompt.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userPrompt }]);
    setPrompt('');
    setIsLoading(true);
    
    try {
      // First get a chat response
      const chatResponse = await aiService.movieChat(userPrompt);
      setChatHistory(prev => [...prev, { role: 'ai', content: chatResponse }]);
      
      // Then get movie recommendations
      const recommendationParams = { prompt: userPrompt };
      const results = await aiService.getRecommendations(recommendationParams);
      setRecommendations(results);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle the AI recommendation panel
  const togglePanel = () => setIsOpen(prev => !prev);
  
  return (
    <>
      {/* Floating button */}
      <button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full w-14 h-14 transition-all duration-300 ${
          isOpen 
            ? 'bg-white text-tmdb-dark rotate-90 scale-90' 
            : 'bg-tmdb-red text-white scale-100'
        }`}
      >
        {isOpen ? <X size={24} /> : <Send size={20} />}
      </button>
      
      {/* AI recommendations panel */}
      <div className={`fixed right-0 bottom-0 w-full max-w-md h-[70vh] bg-tmdb-dark/95 backdrop-blur-xl rounded-t-2xl z-40 
        shadow-2xl transition-transform duration-500 ease-in-out transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-lg">AI Movie Recommendations</h3>
            <button 
              onClick={togglePanel}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Chat and recommendations area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-400 p-8">
                <p className="mb-2">Ask for movie recommendations!</p>
                <p className="text-sm">Examples:</p>
                <ul className="text-sm text-gray-500 space-y-1 mt-2">
                  <li>"Recommend sci-fi movies from the 90s"</li>
                  <li>"I'm feeling sad, what should I watch?"</li>
                  <li>"Movies like Inception with mind-bending plots"</li>
                </ul>
              </div>
            ) : (
              <>
                {/* Chat messages */}
                {chatHistory.map((message, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user' 
                          ? 'bg-tmdb-blue text-white rounded-tr-none' 
                          : 'bg-white/10 text-white rounded-tl-none'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">RECOMMENDED MOVIES</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {recommendations.map((movie, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                          <h5 className="font-medium">{movie.title}</h5>
                          <p className="text-xs text-gray-400 mb-1">{movie.year} {movie.director ? `• ${movie.director}` : ''}</p>
                          {movie.reason && (
                            <p className="text-xs text-gray-300 mt-2 line-clamp-2">{movie.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-3 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for movie recommendations..."
                className="flex-1 py-2 px-4 bg-white/10 rounded-full focus:outline-none focus:ring-1 focus:ring-tmdb-red/50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`rounded-full p-2.5 transition-colors ${
                  isLoading || !prompt.trim() 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-tmdb-red text-white hover:bg-tmdb-red/90'
                }`}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIRecommendations;
