import React, { useRef, useEffect, useState } from 'react';
import { YouTubeVideo } from '../types/youtube';

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
  const [colors, setColors] = useState({
    primary: '#FF3CAC',
    secondary: '#784BA0',
    accent: '#2B2D42',
  });

  // Extract colors from track metadata
  useEffect(() => {
    if (!currentTrack) return;

    const title = currentTrack.title.toLowerCase();
    const videoId = currentTrack.id;

    // Generate unique colors based on video ID
    const hash = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;
    
    // Enhanced color mapping based on genre/mood
    let selectedColors = {
      primary: `hsl(${hue1}, 70%, 60%)`,
      secondary: `hsl(${hue2}, 70%, 60%)`,
      accent: `hsl(${hue3}, 30%, 15%)`,
    };

    // Genre-specific color overrides
    if (title.includes('rock') || title.includes('metal')) {
      selectedColors = { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#1A1A2E' };
    } else if (title.includes('electronic') || title.includes('edm')) {
      selectedColors = { primary: '#00D4FF', secondary: '#FF0080', accent: '#0F0F23' };
    } else if (title.includes('classical') || title.includes('piano')) {
      selectedColors = { primary: '#E6E6FA', secondary: '#DDA0DD', accent: '#2F1B69' };
    } else if (title.includes('bollywood') || title.includes('hindi')) {
      selectedColors = { primary: '#FF6347', secondary: '#FFD700', accent: '#2F1A0A' };
    }

    setColors(selectedColors);
  }, [currentTrack]);

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

    const createParticle = (x: number, y: number, intensity: number, frequency: number) => {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * intensity * 3,
        vy: (Math.random() - 0.5) * intensity * 3,
        size: Math.random() * intensity * 2 + 1,
        color: frequency < 0.3 ? colors.primary : frequency > 0.7 ? colors.secondary : colors.primary,
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
            0.2
          );
        }

        if (Math.random() < trebleIntensity * 0.3) {
          createParticle(
            Math.random() * canvasWidth,
            Math.random() * 30,
            trebleIntensity * 12,
            0.8
          );
        }

        if (Math.random() < midIntensity * 0.2) {
          createParticle(
            Math.random() * canvasWidth,
            canvasHeight / 2 + (Math.random() - 0.5) * 40,
            midIntensity * 10,
            0.5
          );
        }

        // Draw enhanced frequency bars with glow effect
        const barCount = Math.min(audioData.length, 64);
        const barWidth = canvasWidth / barCount;
        
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * audioData.length);
          const barHeight = (audioData[dataIndex] / 255) * canvasHeight * 0.8;
          const x = i * barWidth;
          const y = canvasHeight - barHeight;
          
          // Create gradient for each bar
          const gradient = ctx.createLinearGradient(x, canvasHeight, x, y);
          const hue = (i / barCount) * 360;
          gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.8)`);
          gradient.addColorStop(0.5, `hsla(${hue}, 70%, 70%, 0.6)`);
          gradient.addColorStop(1, `hsla(${hue}, 70%, 80%, 0.4)`);
          
          // Draw bar with glow
          ctx.shadowColor = `hsl(${hue}, 70%, 60%)`;
          ctx.shadowBlur = 10;
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 1, barHeight);
          
          // Reset shadow
          ctx.shadowBlur = 0;
        }

        // Draw central waveform
        ctx.beginPath();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.shadowColor = colors.primary;
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
          beatGradient.addColorStop(0, `${colors.primary}40`);
          beatGradient.addColorStop(0.7, `${colors.secondary}20`);
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
          
          gradient.addColorStop(0, `${colors.primary}30`);
          gradient.addColorStop(0.5, `${colors.secondary}15`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Gentle wave lines
        ctx.strokeStyle = `${colors.primary}40`;
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
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>
      </div>
    </div>
  );
};