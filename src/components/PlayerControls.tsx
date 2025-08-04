import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  volume: number;
  isLiked: boolean;
  onToggleLike: () => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'off' | 'one' | 'all';
  onToggleRepeat: () => void;
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
  volume,
  isLiked,
  onToggleLike,
  isShuffled,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {/* Secondary Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleShuffle}
          className={`p-2 rounded-full transition-colors ${
            isShuffled ? 'text-blue-500 bg-blue-100' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Shuffle size={18} />
        </button>
        
        <button
          onClick={onToggleLike}
          className={`p-2 rounded-full transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onPrevious}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <SkipBack size={24} />
        </button>
        
        <button
          onClick={onPlayPause}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={onNext}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Volume and Repeat */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleRepeat}
          className={`p-2 rounded-full transition-colors ${
            repeatMode !== 'off' ? 'text-blue-500 bg-blue-100' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Repeat size={18} />
          {repeatMode === 'one' && (
            <span className="absolute -mt-1 -mr-1 text-xs">1</span>
          )}
        </button>
        
        <div className="flex items-center space-x-2">
          <Volume2 size={18} className="text-gray-600" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}