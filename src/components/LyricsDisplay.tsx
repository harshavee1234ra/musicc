import React, { useState, useEffect, useRef } from 'react';
import { Music, Loader2, X, Type, Scroll } from 'lucide-react';
import { YouTubeVideo } from '../types/youtube';
import { lyricsApi, LyricsResponse, LyricsLine } from '../services/lyricsApi';

interface LyricsDisplayProps {
  currentTrack: YouTubeVideo | null;
  currentTime: number;
  isPlaying: boolean;
  onClose: () => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  currentTrack,
  currentTime,
  isPlaying,
  onClose,
}) => {
  const [lyrics, setLyrics] = useState<LyricsResponse | null>(null);
  const [syncedLyrics, setSyncedLyrics] = useState<LyricsLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSynced, setShowSynced] = useState(true);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack) {
      setLyrics(null);
      setSyncedLyrics([]);
      setError(null);
      return;
    }

    const fetchLyrics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cleanArtist = lyricsApi.cleanArtistName(currentTrack.channelTitle);
        const cleanTrack = lyricsApi.cleanTrackName(currentTrack.title);

        // Try to get all formats of lyrics
        const lyricsData = await lyricsApi.getAllLyricsFormats(cleanArtist, cleanTrack);

        if (lyricsData.metadata) {
          setLyrics(lyricsData.metadata);
          
          if (lyricsData.synced && lyricsData.synced.length > 0) {
            setSyncedLyrics(lyricsData.synced);
            setShowSynced(true);
          } else if (lyricsData.metadata.syncedLyrics) {
            // Fallback to parsing synced lyrics from metadata
            const parsed = lyricsApi.parseSyncedLyrics(lyricsData.metadata.syncedLyrics);
            setSyncedLyrics(parsed);
            setShowSynced(parsed.length > 0);
          } else {
            setSyncedLyrics([]);
            setShowSynced(false);
          }
        } else {
          setError('No lyrics found for this song');
          setLyrics(null);
          setSyncedLyrics([]);
        }
      } catch (err) {
        console.error('Error fetching lyrics:', err);
        setError('Failed to fetch lyrics');
        setLyrics(null);
        setSyncedLyrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [currentTrack]);

  // Update current lyric index based on playback time
  useEffect(() => {
    if (syncedLyrics.length > 0 && showSynced) {
      const index = lyricsApi.getCurrentLyricIndex(syncedLyrics, currentTime);
      setCurrentLyricIndex(index);
    }
  }, [currentTime, syncedLyrics, showSynced]);

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

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Music className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No song selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm truncate max-w-48">
              {currentTrack.title}
            </h3>
            <p className="text-gray-400 text-xs truncate max-w-48">
              {currentTrack.channelTitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lyrics && syncedLyrics.length > 0 && (
            <button
              onClick={() => setShowSynced(!showSynced)}
              className={`p-2 rounded-lg transition-colors ${
                showSynced 
                  ? 'bg-[#FF3CAC]/20 text-[#FF3CAC]' 
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
              title={showSynced ? 'Show plain lyrics' : 'Show synced lyrics'}
            >
              {showSynced ? <Scroll className="h-4 w-4" /> : <Type className="h-4 w-4" />}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF3CAC] mx-auto mb-3" />
              <p className="text-gray-400">Fetching lyrics...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="mb-2">{error}</p>
              <p className="text-sm opacity-75">Try a different song</p>
            </div>
          </div>
        ) : lyrics ? (
          <div
            ref={lyricsContainerRef}
            className="h-full overflow-y-auto p-4 space-y-2 scrollbar-hide"
          >
            {lyrics.instrumental ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>This song is instrumental</p>
                  <p className="text-sm opacity-75 mt-2">No lyrics available</p>
                </div>
              </div>
            ) : showSynced && syncedLyrics.length > 0 ? (
              // Synced lyrics with highlighting
              syncedLyrics.map((line, index) => (
                <div
                  key={index}
                  ref={index === currentLyricIndex ? currentLineRef : null}
                  className={`transition-all duration-300 py-2 px-3 rounded-lg cursor-pointer ${
                    index === currentLyricIndex
                      ? 'text-white bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 border-l-2 border-[#FF3CAC] transform scale-105 shadow-lg'
                      : index < currentLyricIndex
                      ? 'text-gray-500'
                      : 'text-gray-300 hover:text-gray-200'
                  }`}
                  onClick={() => {
                    // Allow users to click on lyrics to seek to that time
                    const seekTime = line.startTime / 1000; // Convert to seconds
                    // You can emit an event or call a callback here to seek the player
                    console.log('Seek to:', seekTime);
                  }}
                >
                  <p className="text-sm md:text-base leading-relaxed">
                    {line.text}
                  </p>
                  {index === currentLyricIndex && (
                    <div className="text-xs text-[#FF3CAC] mt-1 opacity-75">
                      {Math.floor(line.startTime / 60000)}:{String(Math.floor((line.startTime % 60000) / 1000)).padStart(2, '0')}
                    </div>
                  )}
                </div>
              ))
            ) : lyrics.plainLyrics ? (
              // Plain lyrics
              <div className="text-gray-300 whitespace-pre-line text-sm md:text-base leading-relaxed">
                {lyrics.plainLyrics}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No lyrics available</p>
                  <p className="text-sm opacity-75 mt-2">This track may be instrumental</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer info */}
      {lyrics && (
        <div className="p-3 border-t border-white/10 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>
                {lyrics.instrumental ? 'Instrumental' : 
                 showSynced && syncedLyrics.length > 0 ? 'Synced lyrics' : 'Plain lyrics'}
              </span>
              {lyrics.albumName && (
                <span>Album: {lyrics.albumName}</span>
              )}
              {lyrics.duration && (
                <span>Duration: {Math.floor(lyrics.duration / 60)}:{String(lyrics.duration % 60).padStart(2, '0')}</span>
              )}
            </div>
            <span>Powered by LrcLib</span>
          </div>
        </div>
      )}
    </div>
  );
};