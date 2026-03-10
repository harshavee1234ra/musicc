export interface LyricLine {
  text: string;
  startTime: number; // in milliseconds
}

export const parseLRC = (lrcString: string): LyricLine[] => {
  if (!lrcString) return [];

  const lines: LyricLine[] = [];
  const lrcLines = lrcString.split('\n');

  for (const line of lrcLines) {
    // Match LRC format: [mm:ss.xx] or [mm:ss.xxx] text
    const match = line.match(/\[(\d{1,2}):(\d{2})\.(\d{2,3})\]\s*(.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const centiseconds = parseInt(match[3].padEnd(3, '0'), 10); // Handle both .xx and .xxx formats
      const text = match[4].trim();
      
      // Convert to milliseconds
      const startTime = (minutes * 60 + seconds) * 1000 + centiseconds;
      
      if (text) {
        lines.push({ text, startTime });
      }
    }
  }

  // Sort by start time to ensure proper order
  return lines.sort((a, b) => a.startTime - b.startTime);
};

export const getCurrentLyricIndex = (lyrics: LyricLine[], currentTime: number): number => {
  const currentTimeMs = currentTime * 1000; // Convert seconds to milliseconds
  
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTimeMs >= lyrics[i].startTime) {
      return i;
    }
  }
  return -1;
};

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};