import React, { useRef, useEffect, useState } from 'react';
import { YouTubeVideo } from '../types/youtube';

interface MoodGenreColors {
  primary: string;
  secondary: string;
  accent: string;
  particles: string[];
  waveform: string;
  background: string;
}

interface WaveformVisualizerProps {
  currentTrack: YouTubeVideo | null;
  isPlaying: boolean;
  audioData?: Uint8Array;
  className?: string;
  height?: number;
  showTitle?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  currentTrack,
  isPlaying,
  audioData,
  className = '',
  height = 120,
  showTitle = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [colors, setColors] = useState<MoodGenreColors>({
    primary: '#FF3CAC',
    secondary: '#784BA0',
    accent: '#2B2D42',
    particles: ['#FF3CAC', '#784BA0', '#FF69B4'],
    waveform: '#FF3CAC',
    background: '#2B2D42',
  });

  // Enhanced mood and genre detection with color mapping
  useEffect(() => {
    if (!currentTrack) return;

    const title = currentTrack.title.toLowerCase();
    const channel = currentTrack.channelTitle.toLowerCase();
    
    // Comprehensive mood and genre color mappings
    const moodGenreColorMaps: { [key: string]: MoodGenreColors } = {
      // Energetic/Upbeat Genres
      rock: {
        primary: '#FF4444',
        secondary: '#FF6B6B',
        accent: '#8B0000',
        particles: ['#FF4444', '#FF6B6B', '#FF8888', '#FFAAAA'],
        waveform: '#FF2222',
        background: '#1A0000',
      },
      metal: {
        primary: '#FF0000',
        secondary: '#CC0000',
        accent: '#000000',
        particles: ['#FF0000', '#CC0000', '#990000', '#660000'],
        waveform: '#FF0000',
        background: '#0A0000',
      },
      electronic: {
        primary: '#00FFFF',
        secondary: '#0080FF',
        accent: '#001133',
        particles: ['#00FFFF', '#0080FF', '#0040FF', '#8000FF'],
        waveform: '#00CCFF',
        background: '#000A1A',
      },
      edm: {
        primary: '#FF00FF',
        secondary: '#00FF80',
        accent: '#1A001A',
        particles: ['#FF00FF', '#00FF80', '#80FF00', '#FF8000'],
        waveform: '#FF40FF',
        background: '#0A000A',
      },
      dance: {
        primary: '#FF1493',
        secondary: '#00CED1',
        accent: '#191970',
        particles: ['#FF1493', '#00CED1', '#FF69B4', '#40E0D0'],
        waveform: '#FF20A0',
        background: '#0A0A2A',
      },
      pop: {
        primary: '#FF69B4',
        secondary: '#FFD700',
        accent: '#2D1B69',
        particles: ['#FF69B4', '#FFD700', '#FF8C69', '#DDA0DD'],
        waveform: '#FF80C0',
        background: '#1A1030',
      },
      
      // Calm/Peaceful Genres
      classical: {
        primary: '#E6E6FA',
        secondary: '#DDA0DD',
        accent: '#2F1B69',
        particles: ['#E6E6FA', '#DDA0DD', '#D8BFD8', '#C8A2C8'],
        waveform: '#E0E0F0',
        background: '#1A1030',
      },
      piano: {
        primary: '#F0F8FF',
        secondary: '#E0E6FF',
        accent: '#1E1E3F',
        particles: ['#F0F8FF', '#E0E6FF', '#D0D6EF', '#C0C6DF'],
        waveform: '#F8F8FF',
        background: '#0F0F2F',
      },
      jazz: {
        primary: '#CD853F',
        secondary: '#D2691E',
        accent: '#2F1B14',
        particles: ['#CD853F', '#D2691E', '#DAA520', '#B8860B'],
        waveform: '#D4A050',
        background: '#1A1008',
      },
      blues: {
        primary: '#4169E1',
        secondary: '#1E90FF',
        accent: '#0F0F2F',
        particles: ['#4169E1', '#1E90FF', '#6495ED', '#87CEEB'],
        waveform: '#5080F0',
        background: '#080820',
      },
      ambient: {
        primary: '#87CEEB',
        secondary: '#B0E0E6',
        accent: '#1A2F3A',
        particles: ['#87CEEB', '#B0E0E6', '#ADD8E6', '#E0F6FF'],
        waveform: '#A0D0E0',
        background: '#0A1520',
      },
      acoustic: {
        primary: '#DEB887',
        secondary: '#F4A460',
        accent: '#2F2416',
        particles: ['#DEB887', '#F4A460', '#D2B48C', '#BC9A6A'],
        waveform: '#E0C090',
        background: '#1A1508',
      },
      
      // Cultural/Regional
      bollywood: {
        primary: '#FF6347',
        secondary: '#FFD700',
        accent: '#2F1A0A',
        particles: ['#FF6347', '#FFD700', '#FF8C00', '#FFA500'],
        waveform: '#FF7050',
        background: '#1A0A00',
      },
      hindi: {
        primary: '#FF4500',
        secondary: '#FF8C00',
        accent: '#2F1608',
        particles: ['#FF4500', '#FF8C00', '#FFA500', '#FFB347'],
        waveform: '#FF6000',
        background: '#1A0800',
      },
      devotional: {
        primary: '#FFA500',
        secondary: '#FFD700',
        accent: '#2F1A00',
        particles: ['#FFA500', '#FFD700', '#FFFF00', '#F0E68C'],
        waveform: '#FFB800',
        background: '#1A1000',
      },
      tamil: {
        primary: '#DC143C',
        secondary: '#FF69B4',
        accent: '#2F0A14',
        particles: ['#DC143C', '#FF69B4', '#FF1493', '#C71585'],
        waveform: '#E0305C',
        background: '#1A0508',
      },
      
      // Mood-based
      sad: {
        primary: '#4682B4',
        secondary: '#708090',
        accent: '#1C1C2E',
        particles: ['#4682B4', '#708090', '#6A5ACD', '#9370DB'],
        waveform: '#5090C0',
        background: '#0A0A1A',
      },
      happy: {
        primary: '#FFD700',
        secondary: '#FF69B4',
        accent: '#2F2A0A',
        particles: ['#FFD700', '#FF69B4', '#FFA500', '#FF8C69'],
        waveform: '#FFE040',
        background: '#1A1508',
      },
      romantic: {
        primary: '#FF1493',
        secondary: '#FF69B4',
        accent: '#2F0A1A',
        particles: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB'],
        waveform: '#FF40A0',
        background: '#1A0510',
      },
      party: {
        primary: '#FF00FF',
        secondary: '#00FFFF',
        accent: '#2F002F',
        particles: ['#FF00FF', '#00FFFF', '#FF8000', '#80FF00'],
        waveform: '#FF80FF',
        background: '#1A001A',
      },
      workout: {
        primary: '#FF4500',
        secondary: '#32CD32',
        accent: '#2F1608',
        particles: ['#FF4500', '#32CD32', '#FF6347', '#7FFF00'],
        waveform: '#FF6020',
        background: '#1A0800',
      },
      chill: {
        primary: '#20B2AA',
        secondary: '#48D1CC',
        accent: '#0A2A2A',
        particles: ['#20B2AA', '#48D1CC', '#40E0D0', '#AFEEEE'],
        waveform: '#30C0B0',
        background: '#051515',
      },
      
      // Time-based moods
      morning: {
        primary: '#FFE4B5',
        secondary: '#FFEFD5',
        accent: '#2F2A1A',
        particles: ['#FFE4B5', '#FFEFD5', '#F0E68C', '#DDA0DD'],
        waveform: '#FFF0C0',
        background: '#1A1510',
      },
      night: {
        primary: '#191970',
        secondary: '#483D8B',
        accent: '#0A0A2A',
        particles: ['#191970', '#483D8B', '#6A5ACD', '#9370DB'],
        waveform: '#3040A0',
        background: '#050510',
      },
    };

    // Generate unique colors from video ID if no genre match
    const generateColorsFromId = (id: string): MoodGenreColors => {
      const hash = id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const hue1 = Math.abs(hash) % 360;
      const hue2 = (hue1 + 120) % 360;
      const hue3 = (hue1 + 240) % 360;
      
      const primary = `hsl(${hue1}, 70%, 60%)`;
      const secondary = `hsl(${hue2}, 70%, 60%)`;
      
      return {
        primary,
        secondary,
        accent: `hsl(${hue3}, 30%, 15%)`,
        particles: [
          primary,
          secondary,
          `hsl(${(hue1 + 60) % 360}, 70%, 60%)`,
          `hsl(${(hue1 + 180) % 360}, 70%, 60%)`,
        ],
        waveform: primary,
        background: `hsl(${hue3}, 30%, 10%)`,
      };
    };

    // Check for genre/mood keywords with priority scoring
    let bestMatch: { colors: MoodGenreColors; score: number } | null = null;
    
    for (const [keyword, colorMap] of Object.entries(moodGenreColorMaps)) {
      let score = 0;
      
      // Check title for exact matches
      if (title.includes(keyword)) {
        score += 10;
      }
      
      // Check channel for matches
      if (channel.includes(keyword)) {
        score += 5;
      }
      
      // Check for partial matches and related terms
      const relatedTerms: { [key: string]: string[] } = {
        rock: ['guitar', 'band', 'live'],
        electronic: ['synth', 'beat', 'remix', 'mix'],
        bollywood: ['film', 'movie', 'cinema'],
        sad: ['slow', 'melancholy', 'emotional'],
        happy: ['upbeat', 'cheerful', 'celebration'],
        romantic: ['love', 'heart', 'valentine'],
        party: ['club', 'festival', 'celebration'],
        devotional: ['bhajan', 'prayer', 'spiritual', 'temple'],
        classical: ['orchestra', 'symphony', 'instrumental'],
      };
      
      if (relatedTerms[keyword]) {
        for (const term of relatedTerms[keyword]) {
          if (title.includes(term) || channel.includes(term)) {
            score += 3;
          }
        }
      }
      
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { colors: colorMap, score };
      }
    }
    
    // Use best match or generate unique colors
    const selectedColors = bestMatch 
      ? bestMatch.colors 
      : generateColorsFromId(currentTrack.id);

    setColors(selectedColors);
  }, [currentTrack]);

  // Enhanced audio analysis for mood detection
  const analyzeMoodFromAudio = (audioData: Uint8Array): string => {
    if (!audioData || audioData.length === 0) return 'neutral';
    
    const bassRange = audioData.slice(0, Math.floor(audioData.length * 0.1));
    const midRange = audioData.slice(Math.floor(audioData.length * 0.1), Math.floor(audioData.length * 0.6));
    const trebleRange = audioData.slice(Math.floor(audioData.length * 0.6));

    const bassSum = bassRange.reduce((sum, val) => sum + val, 0);
    const midSum = midRange.reduce((sum, val) => sum + val, 0);
    const trebleSum = trebleRange.reduce((sum, val) => sum + val, 0);

    const bassIntensity = bassSum / bassRange.length / 255;
    const midIntensity = midSum / midRange.length / 255;
    const trebleIntensity = trebleSum / trebleRange.length / 255;
    
    // Determine mood based on frequency distribution
    if (bassIntensity > 0.7 && trebleIntensity > 0.6) return 'energetic';
    if (bassIntensity > 0.6 && midIntensity < 0.3) return 'heavy';
    if (trebleIntensity > 0.7 && bassIntensity < 0.3) return 'bright';
    if (midIntensity > 0.6 && bassIntensity < 0.4 && trebleIntensity < 0.4) return 'vocal';
    if (bassIntensity < 0.3 && midIntensity < 0.3 && trebleIntensity < 0.3) return 'quiet';
    
    return 'balanced';
  };

  // Dynamic color adjustment based on audio mood
  const getAudioMoodColors = (audioMood: string, baseColors: MoodGenreColors): MoodGenreColors => {
    const adjustments: { [key: string]: Partial<MoodGenreColors> } = {
      energetic: {
        particles: baseColors.particles.map(color => color.replace('60%', '80%')),
        waveform: baseColors.primary.replace('60%', '85%'),
      },
      heavy: {
        particles: baseColors.particles.map(color => color.replace('60%', '40%')),
        waveform: baseColors.primary.replace('60%', '45%'),
      },
      bright: {
        particles: baseColors.particles.map(color => color.replace('60%', '75%')),
        waveform: baseColors.primary.replace('60%', '80%'),
      },
      quiet: {
        particles: baseColors.particles.map(color => color.replace('60%', '30%')),
        waveform: baseColors.primary.replace('60%', '35%'),
      },
    };
    
    return { ...baseColors, ...adjustments[audioMood] };
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.offsetWidth * 2; // High DPI
      canvas.height = height * 2;
      canvas.style.width = container.offsetWidth + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(2, 2);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      frequency: number;
    }> = [];

    const createParticle = (x: number, y: number, intensity: number, frequency: number, audioMood?: string) => {
      const moodColors = audioMood ? getAudioMoodColors(audioMood, colors) : colors;
      const particleColor = moodColors.particles[Math.floor(Math.random() * moodColors.particles.length)];
      
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * intensity * 3,
        vy: (Math.random() - 0.5) * intensity * 3,
        size: Math.random() * intensity * 2 + 1,
        color: particleColor,
        life: 1,
        frequency,
      });
    };

    const animate = () => {
      const canvasWidth = canvas.width / 2;
      const canvasHeight = canvas.height / 2;
      
      // Clear with fade effect
      ctx.fillStyle = 'rgba(43, 45, 66, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      time += 0.016;

      if (isPlaying && audioData && audioData.length > 0) {
        // Analyze current audio mood
        const audioMood = analyzeMoodFromAudio(audioData);
        const currentColors = getAudioMoodColors(audioMood, colors);
        
        // Analyze audio data for different frequency ranges
        const bassRange = audioData.slice(0, Math.floor(audioData.length * 0.1));
        const midRange = audioData.slice(Math.floor(audioData.length * 0.1), Math.floor(audioData.length * 0.6));
        const trebleRange = audioData.slice(Math.floor(audioData.length * 0.6));

        const bassSum = bassRange.reduce((sum, val) => sum + val, 0);
        const midSum = midRange.reduce((sum, val) => sum + val, 0);
        const trebleSum = trebleRange.reduce((sum, val) => sum + val, 0);

        const bassIntensity = bassSum / bassRange.length / 255;
        const midIntensity = midSum / midRange.length / 255;
        const trebleIntensity = trebleSum / trebleRange.length / 255;

        // Create particles based on audio intensity
        if (Math.random() < bassIntensity * 0.4) {
          createParticle(
            Math.random() * canvasWidth,
            canvasHeight - Math.random() * 30,
            bassIntensity * 15,
            0.2,
            audioMood
          );
        }

        if (Math.random() < trebleIntensity * 0.3) {
          createParticle(
            Math.random() * canvasWidth,
            Math.random() * 30,
            trebleIntensity * 12,
            0.8,
            audioMood
          );
        }

        if (Math.random() < midIntensity * 0.2) {
          createParticle(
            Math.random() * canvasWidth,
            canvasHeight / 2 + (Math.random() - 0.5) * 40,
            midIntensity * 10,
            0.5,
            audioMood
          );
        }

        // Draw enhanced frequency bars with mood-based colors
        const barCount = Math.min(audioData.length, 64);
        const barWidth = canvasWidth / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * audioData.length);
          const barHeight = (audioData[dataIndex] / 255) * canvasHeight * 0.8;
          const x = i * barWidth;
          const y = canvasHeight - barHeight;
          
          // Create mood-based gradient for each bar
          const gradient = ctx.createLinearGradient(x, canvasHeight, x, y);
          
          // Use mood colors for bars
          const barColorIndex = Math.floor((i / barCount) * currentColors.particles.length);
          const barColor = currentColors.particles[barColorIndex];
          
          gradient.addColorStop(0, barColor.replace(')', ', 0.8)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          gradient.addColorStop(0.5, barColor.replace(')', ', 0.6)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          gradient.addColorStop(1, barColor.replace(')', ', 0.4)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          
          // Draw bar with glow
          ctx.shadowColor = barColor;
          ctx.shadowBlur = 10;
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          
          // Reset shadow
          ctx.shadowBlur = 0;
        }

        // Draw central waveform
        ctx.beginPath();
        ctx.strokeStyle = currentColors.waveform;
        ctx.lineWidth = 3;
        ctx.shadowColor = currentColors.waveform;
        ctx.shadowBlur = 5;
        
        const centerY = canvasHeight / 2;
        const waveformScale = canvasHeight * 0.3;
        
        for (let i = 0; i < audioData.length; i += 2) {
          const x = (i / audioData.length) * canvasWidth;
          const y = centerY + ((audioData[i] - 128) / 128) * waveformScale;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw beat detection circles
        const totalIntensity = (bassIntensity + midIntensity + trebleIntensity) / 3;
        if (totalIntensity > 0.6) {
          const beatRadius = totalIntensity * 50;
          const beatGradient = ctx.createRadialGradient(
            canvasWidth / 2, centerY, 0,
            canvasWidth / 2, centerY, beatRadius
          );
          beatGradient.addColorStop(0, currentColors.primary.replace(')', ', 0.25)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          beatGradient.addColorStop(0.7, currentColors.secondary.replace(')', ', 0.12)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          beatGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = beatGradient;
          ctx.beginPath();
          ctx.arc(canvasWidth / 2, centerY, beatRadius, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (currentTrack) {
        // Ambient animation when paused
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Breathing effect
        for (let i = 0; i < 3; i++) {
          const radius = 30 + i * 20 + Math.sin(time * 2 + i) * 10;
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          
          gradient.addColorStop(0, colors.primary.replace(')', ', 0.18)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          gradient.addColorStop(0.5, colors.secondary.replace(')', ', 0.08)').replace('hsl', 'hsla').replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gentle wave lines
        ctx.strokeStyle = colors.primary.replace(')', ', 0.25)').replace('hsl', 'hsla').replace('rgb', 'rgba');
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < canvasWidth; x += 5) {
          const y = centerY + Math.sin((x / canvasWidth) * Math.PI * 4 + time * 3) * 15;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.015;
        particle.size *= 0.98;
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        if (particle.life <= 0 || particle.size < 0.5) {
          particles.splice(i, 1);
          continue;
        }
        
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioData, colors, height]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {showTitle && (
        <div className="text-center mb-4">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">
            {currentTrack.title}
          </h3>
          <p className="text-gray-400 text-sm truncate">
            {currentTrack.channelTitle}
          </p>
        </div>
      )}
      
      <div className="relative w-full rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ height: `${height}px` }}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />
        
        {/* Play state indicator */}
        <div className="absolute top-2 right-2">
          <div 
            className={`w-3 h-3 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ 
              backgroundColor: isPlaying ? colors.primary : '#6B7280',
              boxShadow: isPlaying ? `0 0 8px ${colors.primary}` : 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};