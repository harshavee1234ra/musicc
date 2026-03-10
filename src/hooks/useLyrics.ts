import { useState, useEffect } from 'react';
import { Client } from 'lrclib-api';
import { cleanTitle } from '../utils/cleanTitle';
import { parseLRC, LyricLine } from '../utils/lrcParser';
import { YouTubeVideo } from '../types/youtube';

interface LyricsData {
  syncedLyrics: LyricLine[];
  plainLyrics: string;
  isInstrumental: boolean;
  metadata: {
    trackName: string;
    artistName: string;
    albumName?: string;
    duration?: number;
  } | null;
}

interface UseLyricsReturn {
  lyricsData: LyricsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLyrics = (currentTrack: YouTubeVideo | null): UseLyricsReturn => {
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState(() => new Client());

  const fetchLyrics = async (track: YouTubeVideo) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean the title and extract artist/track names
      const { trackName, artistName } = cleanTitle(track.title, track.channelTitle);

      const query = {
        track_name: trackName,
        artist_name: artistName,
      };

      // Try to get lyrics metadata first
      const metadata = await client.findLyrics(query);

      if (metadata) {
        const syncedLyrics = metadata.syncedLyrics ? parseLRC(metadata.syncedLyrics) : [];
        
        setLyricsData({
          syncedLyrics,
          plainLyrics: metadata.plainLyrics || '',
          isInstrumental: metadata.instrumental || false,
          metadata: {
            trackName: metadata.trackName,
            artistName: metadata.artistName,
            albumName: metadata.albumName,
            duration: metadata.duration,
          },
        });
      } else {
        // Try alternative methods if metadata search fails
        const [unsynced, synced] = await Promise.all([
          client.getUnsynced(query).catch(() => null),
          client.getSynced(query).catch(() => null),
        ]);

        if (synced && synced.length > 0) {
          setLyricsData({
            syncedLyrics: synced,
            plainLyrics: synced.map(line => line.text).join('\n'),
            isInstrumental: false,
            metadata: {
              trackName,
              artistName,
            },
          });
        } else if (unsynced && unsynced.length > 0) {
          setLyricsData({
            syncedLyrics: [],
            plainLyrics: unsynced.map(line => line.text).join('\n'),
            isInstrumental: false,
            metadata: {
              trackName,
              artistName,
            },
          });
        } else {
          setError('No lyrics found for this track');
          setLyricsData(null);
        }
      }
    } catch (err) {
      console.error('Error fetching lyrics:', err);
      setError('Failed to fetch lyrics');
      setLyricsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (currentTrack) {
      fetchLyrics(currentTrack);
    }
  };

  useEffect(() => {
    if (currentTrack) {
      fetchLyrics(currentTrack);
    } else {
      setLyricsData(null);
      setError(null);
    }
  }, [currentTrack]);

  return {
    lyricsData,
    isLoading,
    error,
    refetch,
  };
};