import { Client } from 'lrclib-api';

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
  text: string;
  startTime: number; // in milliseconds
}

export interface UnsyncedLyricsLine {
  text: string;
}

export class LyricsApiService {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async searchLyrics(artist: string, track: string, album?: string, duration?: number): Promise<LyricsResponse | null> {
    try {
      const query = {
        artist_name: this.cleanArtistName(artist),
        track_name: this.cleanTrackName(track),
        ...(album && { album_name: album }),
        ...(duration && { duration: Math.round(duration) })
      };

      const metadata = await this.client.findLyrics(query);
      
      if (!metadata) {
        return null;
      }

      return {
        id: metadata.id,
        name: metadata.name,
        trackName: metadata.trackName,
        artistName: metadata.artistName,
        albumName: metadata.albumName,
        duration: metadata.duration,
        instrumental: metadata.instrumental,
        plainLyrics: metadata.plainLyrics || '',
        syncedLyrics: metadata.syncedLyrics || ''
      };
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      return null;
    }
  }

  async getUnsyncedLyrics(artist: string, track: string, album?: string): Promise<UnsyncedLyricsLine[] | null> {
    try {
      const query = {
        artist_name: this.cleanArtistName(artist),
        track_name: this.cleanTrackName(track),
        ...(album && { album_name: album })
      };

      const unsynced = await this.client.getUnsynced(query);
      return unsynced || null;
    } catch (error) {
      console.error('Error fetching unsynced lyrics:', error);
      return null;
    }
  }

  async getSyncedLyrics(artist: string, track: string, album?: string): Promise<LyricsLine[] | null> {
    try {
      const query = {
        artist_name: this.cleanArtistName(artist),
        track_name: this.cleanTrackName(track),
        ...(album && { album_name: album })
      };

      const synced = await this.client.getSynced(query);
      return synced || null;
    } catch (error) {
      console.error('Error fetching synced lyrics:', error);
      return null;
    }
  }

  async getLyricsById(id: number): Promise<LyricsResponse | null> {
    try {
      // The lrclib-api doesn't have a direct getById method, so we'll use the search
      // This is a limitation of the current API wrapper
      console.warn('getLyricsById not directly supported by lrclib-api');
      return null;
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
        
        const startTime = (minutes * 60 + seconds) * 1000 + centiseconds * 10; // Convert to milliseconds
        
        if (text) {
          lines.push({ text, startTime });
        }
      }
    }

    return lines.sort((a, b) => a.startTime - b.startTime);
  }

  getCurrentLyricIndex(lyrics: LyricsLine[], currentTime: number): number {
    const currentTimeMs = currentTime * 1000; // Convert seconds to milliseconds
    
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTimeMs >= lyrics[i].startTime) {
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

  // Helper method to convert unsynced lyrics to display format
  formatUnsyncedLyrics(unsyncedLyrics: UnsyncedLyricsLine[]): string {
    return unsyncedLyrics.map(line => line.text).join('\n');
  }

  // Helper method to get lyrics in multiple formats
  async getAllLyricsFormats(artist: string, track: string, album?: string) {
    try {
      const [metadata, unsynced, synced] = await Promise.all([
        this.searchLyrics(artist, track, album),
        this.getUnsyncedLyrics(artist, track, album),
        this.getSyncedLyrics(artist, track, album)
      ]);

      return {
        metadata,
        unsynced,
        synced,
        hasLyrics: !!(metadata && !metadata.instrumental),
        isInstrumental: metadata?.instrumental || false
      };
    } catch (error) {
      console.error('Error fetching all lyrics formats:', error);
      return {
        metadata: null,
        unsynced: null,
        synced: null,
        hasLyrics: false,
        isInstrumental: false
      };
    }
  }
}

export const lyricsApi = new LyricsApiService();