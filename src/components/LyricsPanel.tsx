import React, { useRef, useEffect } from 'react';
import { Music, Loader2, AlertCircle } from 'lucide-react';
import { useLyrics } from '../hooks/useLyrics';
import { getCurrentLyricIndex } from '../utils/lrcParser';
import { YouTubeVideo } from '../types/youtube';

interface LyricsPanelProps {
  currentTrack: YouTubeVideo | null;
  currentTime: number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  currentTrack,
  currentTime,
  isPlaying,
  onSeek,
  className = '',
}) => {
  const { lyricsData, isLoading, error } = useLyrics(currentTrack);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  const currentLyricIndex = lyricsData?.syncedLyrics.length 
    ? getCurrentLyricIndex(lyricsData.syncedLyrics, currentTime)
    : -1;

  // Auto-scroll to current lyric
  useEffect(() => {
    if (currentLineRef.current && lyricsContainerRef.current && isPlaying && currentLyricIndex >= 0) {
      const container = lyricsContainerRef.current;
      const currentLine = currentLineRef.current;
      
      const containerHeight = container.clientHeight;
      const lineTop = currentLine.offsetTop;
      const lineHeight = currentLine.clientHeight;
      
      const scrollTop = lineTop - containerHeight / 2 + lineHeight / 2;
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth',
      });
    }
  }, [currentLyricIndex, isPlaying]);

  const handleLyricClick = (startTime: number) => {
    if (onSeek) {
      onSeek(startTime / 1000); // Convert milliseconds to seconds
    }
  };

  if (!currentTrack) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-400">
          <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No song selected</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF3CAC] mx-auto mb-3" />
          <p className="text-gray-400">Fetching lyrics...</p>
        </div>
      </div>
    );
  }

  if (error || !lyricsData) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-400">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="mb-2">{error || 'No lyrics available'}</p>
          <p className="text-sm opacity-75">Try a different song</p>
        </div>
      </div>
    );
  }

  if (lyricsData.isInstrumental) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-400">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>This song is instrumental</p>
          <p className="text-sm opacity-75 mt-2">No lyrics available</p>
        </div>
      </div>
    );
  }

  const hasSync = lyricsData.syncedLyrics.length > 0;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-lg truncate">
          {lyricsData.metadata?.trackName || currentTrack.title}
        </h3>
        <p className="text-gray-400 text-sm truncate">
          {lyricsData.metadata?.artistName || currentTrack.channelTitle}
        </p>
        {lyricsData.metadata?.albumName && (
          <p className="text-gray-500 text-xs truncate mt-1">
            {lyricsData.metadata.albumName}
          </p>
        )}
      </div>

      {/* Lyrics Content */}
      <div
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide"
      >
        {hasSync ? (
          // Synced lyrics with highlighting
          lyricsData.syncedLyrics.map((line, index) => (
            <div
              key={index}
              ref={index === currentLyricIndex ? currentLineRef : null}
              className={`transition-all duration-300 py-2 px-3 rounded-lg cursor-pointer ${
                index === currentLyricIndex
                  ? 'text-white bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 border-l-2 border-[#FF3CAC] transform scale-105 shadow-lg'
                  : index < currentLyricIndex
                  ? 'text-gray-500'
                  : 'text-gray-300 hover:text-gray-200 hover:bg-white/5'
              }`}
              onClick={() => handleLyricClick(line.startTime)}
            >
              <p className="text-sm md:text-base leading-relaxed">
                {line.text}
              </p>
              {index === currentLyricIndex && onSeek && (
                <div className="text-xs text-[#FF3CAC] mt-1 opacity-75">
                  {Math.floor(line.startTime / 60000)}:{String(Math.floor((line.startTime % 60000) / 1000)).padStart(2, '0')}
                </div>
              )}
            </div>
          ))
        ) : (
          // Plain lyrics
          <div className="text-gray-300 whitespace-pre-line text-sm md:text-base leading-relaxed">
            {lyricsData.plainLyrics}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-white/10 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {hasSync ? 'Synced lyrics' : 'Plain lyrics'}
            {onSeek && hasSync && ' • Click to seek'}
          </span>
          <span>Powered by LrcLib</span>
        </div>
      </div>
    </div>
  );
};