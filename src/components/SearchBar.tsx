import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Mic, MicOff, Clock, User } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { youtubeApi } from '../services/youtubeApi';
import { YouTubeVideo } from '../types/youtube';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

interface SearchSuggestion extends YouTubeVideo {
  highlightedTitle: string;
  highlightedArtist: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const handleVoiceResult = (transcript: string) => {
    setQuery(transcript);
    if (transcript.trim()) {
      onSearch(transcript.trim());
      setShowSuggestions(false);
    }
  };

  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch(handleVoiceResult);

  // Highlight matching text
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black px-1 rounded">$1</mark>');
  };

  // Fetch suggestions
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await youtubeApi.searchVideos(searchQuery, 8);
      const suggestionsWithHighlights: SearchSuggestion[] = results.map(video => ({
        ...video,
        highlightedTitle: highlightText(video.title, searchQuery),
        highlightedArtist: highlightText(video.channelTitle, searchQuery),
      }));
      
      setSuggestions(suggestionsWithHighlights);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search for suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e as any);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          setQuery(selectedSuggestion.title);
          onSearch(selectedSuggestion.title);
          setShowSuggestions(false);
        } else {
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    onSearch(suggestion.title);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-4 md:mb-6 relative">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 md:space-x-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={isListening ? transcript : query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={isListening ? "Listening... Speak now!" : "Search for songs, artists, or playlists"}
            className={`w-full pl-10 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-3 text-sm md:text-base bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3CAC]/50 focus:border-transparent transition-all duration-200 ${
              isListening ? 'ring-2 ring-red-500/50 border-red-500/30' : ''
            } ${showSuggestions ? 'rounded-b-none' : ''}`}
            disabled={isLoading}
            autoComplete="off"
          />
          <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2">
            {isLoading || isLoadingSuggestions ? (
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 text-gray-300 animate-spin" />
            ) : (
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
            )}
          </div>
          <button
            type="submit"
            disabled={(!query.trim() && !transcript.trim()) || isLoading}
            className="absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2 px-2 md:px-4 py-1 md:py-1.5 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200 text-xs md:text-sm font-medium"
          >
            Search
          </button>
        </div>
        
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={`p-2.5 md:p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/25'
                : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <Mic className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-[#2B2D42]/95 backdrop-blur-sm border border-white/10 border-t-0 rounded-b-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center p-3 cursor-pointer transition-all duration-200 ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 border-l-2 border-[#FF3CAC]'
                  : 'hover:bg-white/10'
              } ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}`}
            >
              <img
                src={suggestion.thumbnails.medium.url}
                alt={suggestion.title}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="ml-3 flex-1 min-w-0">
                <h4
                  className="text-white font-medium text-sm truncate"
                  dangerouslySetInnerHTML={{ __html: suggestion.highlightedTitle }}
                />
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-3 w-3 text-gray-400" />
                  <p
                    className="text-gray-400 text-xs truncate"
                    dangerouslySetInnerHTML={{ __html: suggestion.highlightedArtist }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 ml-2">
                <Clock className="h-3 w-3" />
                <span>{youtubeApi.formatDuration(suggestion.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isListening && (
        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 text-xs md:text-sm font-medium">
              Listening... Speak clearly to search for music
            </span>
          </div>
          {transcript && (
            <div className="mt-1 md:mt-2 text-white text-xs md:text-sm">
              "{transcript}"
            </div>
          )}
        </div>
      )}
      
      {!isSupported && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg backdrop-blur-sm">
          <span className="text-yellow-400 text-xs">
            Voice search is not supported in your browser
          </span>
        </div>
      )}
    </div>
  );
};