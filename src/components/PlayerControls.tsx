import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart, 
  Shuffle, 
  Repeat,
  ChevronDown,
  Mic2,
  Activity,
  ListMusic,
  Share2,
  RotateCcw
} from 'lucide-react';
import { PlayerState } from '../types/youtube';
import { SleepTimer } from './SleepTimer';
import { WaveformScrubber } from './WaveformScrubber';
import { LyricsPanel } from './LyricsPanel';
import { WaveformVisualizer } from './WaveformVisualizer';

interface PlayerControlsProps {
  playerState: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSleepTimerComplete: () => void;
  onRewind?: () => void;
  audioData?: Uint8Array;
  onToggleLike?: (track: any) => void;
  isTrackLiked?: (trackId: string) => boolean;
}

export default function PlayerControls({
  playerState,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onSleepTimerComplete,
  onRewind,
  audioData,
  onToggleLike,
  isTrackLiked
}: PlayerControlsProps) {
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeView, setActiveView] = useState<'thumbnail' | 'lyrics' | 'waveform'>('thumbnail');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const { isPlaying, currentTime, duration, volume, currentTrack } = playerState;

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleVolumeToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    onVolumeChange(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const seekTime = progress * duration;
    onSeek(seekTime);
  };

  const handleLikeToggle = () => {
    if (currentTrack && onToggleLike) {
      onToggleLike(currentTrack);
    }
  };

  const handleShare = () => {
    if (currentTrack) {
      const shareUrl = `https://www.youtube.com/watch?v=${currentTrack.id}`;
      if (navigator.share) {
        navigator.share({
          title: currentTrack.title,
          text: `Check out this song: ${currentTrack.title} by ${currentTrack.channelTitle}`,
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        // You could add a toast notification here
      }
    }
  };

  if (!currentTrack) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isTrackLiked ? isTrackLiked(currentTrack.id) : false;

  // Mobile Full Screen View
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-[#2B2D42] z-50 flex flex-col">
        {/* Top Nav Bar */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => setIsFullScreen(false)}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveView('lyrics')}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Mic2 className="h-5 w-5" />
              {activeView === 'lyrics' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveView('waveform')}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Activity className="h-5 w-5" />
              {activeView === 'waveform' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
              )}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <ListMusic className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visual Area */}
        <div className="flex-1 p-4">
          {activeView === 'thumbnail' && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
              <img
                src={currentTrack.thumbnails.high.url}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {activeView === 'lyrics' && (
            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <LyricsPanel
                currentTrack={currentTrack}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onSeek={onSeek}
                className="h-full"
              />
            </div>
          )}
          
          {activeView === 'waveform' && (
            <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <WaveformVisualizer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                audioData={audioData}
                height={400}
                showTitle={false}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="px-4 pb-2">
          <h2 className="text-white font-bold text-2xl truncate mb-1">
            {currentTrack.title}
          </h2>
          <p className="text-gray-400 text-sm truncate">
            {currentTrack.channelTitle}
          </p>
        </div>

        {/* Progress Section */}
        <div className="px-4 pb-4">
          <div className="flex justify-end mb-2">
            <span className="text-xs text-gray-400">{playbackSpeed}x</span>
          </div>
          
          <div 
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-8 px-4 pb-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffled ? 'text-[#FF3CAC]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          
          <button
            onClick={onPrevious}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-4 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </button>
          
          <button
            onClick={onNext}
            className="p-2 text-white hover:text-gray-300 transition-colors"
          >
            <SkipForward className="h-6 w-6" />
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#FF3CAC]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat className="h-5 w-5" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs bg-[#FF3CAC] text-white rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between px-4 pb-6">
          <button
            onClick={handleLikeToggle}
            className={`p-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">Up Next</p>
            <div className="w-8 h-1 bg-gray-600 rounded-full mx-auto mt-1"></div>
          </div>
          
          <div className="w-5"></div> {/* Spacer for balance */}
        </div>
      </div>
    );
  }

  // Desktop and Mini Player View
  return (
    <>
      {/* Mini Player (Mobile) */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <div 
          className="bg-[#2B2D42]/95 backdrop-blur-sm border border-white/10 rounded-2xl p-4 cursor-pointer"
          onClick={() => setIsFullScreen(true)}
        >
          <div className="flex items-center space-x-3">
            <img
              src={currentTrack.thumbnails.medium.url}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate text-sm">
                {currentTrack.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentTrack.channelTitle}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="p-2 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Player */}
      <div className="hidden lg:block bg-[#2B2D42]/95 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Central Waveform Visualizer */}
          <div className="mb-4 flex justify-center">
            <div className="w-full max-w-md">
              <WaveformScrubber
                currentTime={currentTime}
                duration={duration}
                onSeek={onSeek}
                audioData={audioData}
                isPlaying={isPlaying}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 text-xs text-gray-400 mb-2">
              <span>{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-200"
                  style={{ left: `${progress}%`, marginLeft: '-6px' }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <img
                src={currentTrack.thumbnails.medium.url}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-medium truncate text-sm">
                  {currentTrack.title}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.channelTitle}
                </p>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center space-x-4 mx-8">
              {/* Secondary Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full transition-colors ${
                    isShuffled 
                      ? 'text-[#FF3CAC] bg-[#FF3CAC]/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>

                {onRewind && (
                  <button
                    onClick={onRewind}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Primary Controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onPrevious}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Previous"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={onNext}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  title="Next"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
              </div>

              {/* Loop Control */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors relative ${
                  repeatMode !== 'off' 
                    ? 'text-[#FF3CAC] bg-[#FF3CAC]/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                <Repeat className="h-4 w-4" />
                {repeatMode === 'one' && (
                  <span className="absolute -top-1 -right-1 text-xs bg-[#FF3CAC] text-white rounded-full w-4 h-4 flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              {/* Sleep Timer */}
              <SleepTimer onTimerComplete={onSleepTimerComplete} />

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleVolumeToggle}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Volume: ${volume}%`}
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: linear-gradient(45deg, #FF3CAC, #784BA0);
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: linear-gradient(45deg, #FF3CAC, #784BA0);
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </>
  );
}