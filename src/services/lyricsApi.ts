export interface LyricsResponse {
  id: number;
  name: string;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string;
}

export interface LyricsLine {
  time: number;
  text: string;
}

export class LyricsApiService {
  private baseUrl = 'https://lrclib.net/api';

  async searchLyrics(artist: string, track: string, album?: string, duration?: number): Promise<LyricsResponse | null> {
    try {
      const params = new URLSearchParams({
        artist_name: artist,
        track_name: track,
      });

      if (album) {
        params.append('album_name', album);
      }

      if (duration) {
        params.append('duration', Math.round(duration).toString());
      }

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      
      // Return the first result if available
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  }

  async getLyricsById(id: number): Promise<LyricsResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching lyrics by ID:', error);
      return null;
    }
  }

  parseSyncedLyrics(syncedLyrics: string): LyricsLine[] {
    if (!syncedLyrics) return [];

    const lines: LyricsLine[] = [];
    const lrcLines = syncedLyrics.split('\n');

    for (const line of lrcLines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const centiseconds = parseInt(match[3]);
        const text = match[4].trim();
        
        const time = minutes * 60 + seconds + centiseconds / 100;
        
        if (text) {
          lines.push({ time, text });
        }
      }
    }

    return lines.sort((a, b) => a.time - b.time);
  }

  getCurrentLyricIndex(lyrics: LyricsLine[], currentTime: number): number {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i;
      }
    }
    return -1;
  }

  cleanArtistName(artistName: string): string {
    // Remove common suffixes and prefixes that might interfere with lyrics search
    return artistName
      .replace(/\s*-\s*Topic$/i, '')
      .replace(/\s*Official$/i, '')
      .replace(/\s*VEVO$/i, '')
      .replace(/\s*Records?$/i, '')
      .replace(/\s*Music$/i, '')
      .replace(/\s*Entertainment$/i, '')
      .replace(/\s*\(.*\)$/g, '')
      .replace(/\s*\[.*\]$/g, '')
      .trim();
  }

  cleanTrackName(trackName: string): string {
    // Remove common video-specific text that might interfere with lyrics search
    return trackName
      .replace(/\s*\(Official.*\)/gi, '')
      .replace(/\s*\[Official.*\]/gi, '')
      .replace(/\s*Official\s*(Video|Audio|Music Video)/gi, '')
      .replace(/\s*\(.*Video.*\)/gi, '')
      .replace(/\s*\[.*Video.*\]/gi, '')
      .replace(/\s*\(Lyric.*\)/gi, '')
      .replace(/\s*\[Lyric.*\]/gi, '')
      .replace(/\s*HD$/gi, '')
      .replace(/\s*4K$/gi, '')
      .replace(/\s*-\s*YouTube$/gi, '')
      .trim();
  }
}

export const lyricsApi = new LyricsApiService();