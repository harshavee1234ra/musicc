interface CleanedTitle {
  trackName: string;
  artistName: string;
}

export const cleanTitle = (title: string, channelTitle: string): CleanedTitle => {
  let cleanedTitle = title;
  let cleanedArtist = channelTitle;

  // Remove common video-specific suffixes and prefixes
  const videoPatterns = [
    /\s*\(Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video|Visualizer)\)/gi,
    /\s*\[Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video|Visualizer)\]/gi,
    /\s*Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video|Visualizer)/gi,
    /\s*\(Lyrical?\)/gi,
    /\s*\[Lyrical?\]/gi,
    /\s*Lyrical?\s*(Video)?/gi,
    /\s*\(HD\)/gi,
    /\s*\[HD\]/gi,
    /\s*HD$/gi,
    /\s*4K$/gi,
    /\s*\(4K\)/gi,
    /\s*\[4K\]/gi,
    /\s*-\s*YouTube$/gi,
    /\s*\|\s*YouTube$/gi,
  ];

  // Apply video pattern cleaning
  videoPatterns.forEach(pattern => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });

  // Handle "Provided to YouTube by..." pattern
  if (cleanedTitle.includes('Provided to YouTube by')) {
    const parts = cleanedTitle.split('Provided to YouTube by');
    cleanedTitle = parts[0].trim();
  }

  // Clean channel title from common label suffixes
  const labelPatterns = [
    /\s*-\s*Topic$/i,
    /\s*Official$/i,
    /\s*VEVO$/i,
    /\s*Records?$/i,
    /\s*Music$/i,
    /\s*Entertainment$/i,
    /\s*Label$/i,
    /\s*Productions?$/i,
    /\s*Studios?$/i,
    /\s*Films?$/i,
    /\s*Movies?$/i,
    /\s*Cinema$/i,
    /\s*Media$/i,
    /\s*Digital$/i,
    /\s*Company$/i,
    /\s*Corp\.?$/i,
    /\s*Ltd\.?$/i,
    /\s*Inc\.?$/i,
    /\s*Pvt\.?\s*Ltd\.?$/i,
    /\s*Limited$/i,
  ];

  labelPatterns.forEach(pattern => {
    cleanedArtist = cleanedArtist.replace(pattern, '');
  });

  // Handle Indian music labels specifically
  const indianLabels = [
    'T-Series', 'Sony Music India', 'Zee Music Company', 'Tips Music',
    'Saregama', 'Eros Now', 'Shemaroo Entertainment', 'Venus Worldwide Entertainment',
    'Speed Records', 'White Hill Music', 'Desi Music Factory', 'Punjabi MC'
  ];

  // Check if channel is a known label
  const isKnownLabel = indianLabels.some(label => 
    cleanedArtist.toLowerCase().includes(label.toLowerCase())
  );

  // Try to extract artist from title if channel is a known label
  if (isKnownLabel) {
    // Common patterns for artist extraction from title
    const artistPatterns = [
      // "Song Name - Artist Name" or "Song Name | Artist Name"
      /^(.+?)\s*[-|]\s*(.+?)(?:\s*[-|]\s*.+)?$/,
      // "Artist Name - Song Name"
      /^(.+?)\s*-\s*(.+)$/,
      // "Song Name by Artist Name"
      /^(.+?)\s+by\s+(.+?)(?:\s|$)/i,
      // "Song Name ft. Artist Name" or "Song Name feat. Artist Name"
      /^(.+?)\s+(?:ft\.?|feat\.?|featuring)\s+(.+?)(?:\s|$)/i,
      // "Artist Name: Song Name"
      /^(.+?):\s*(.+)$/,
    ];

    for (const pattern of artistPatterns) {
      const match = cleanedTitle.match(pattern);
      if (match) {
        const [, part1, part2] = match;
        
        // Determine which part is likely the artist
        // Usually the shorter, cleaner part without common song indicators
        const songIndicators = ['song', 'track', 'remix', 'version', 'edit', 'mix'];
        const part1HasSongIndicators = songIndicators.some(indicator => 
          part1.toLowerCase().includes(indicator)
        );
        const part2HasSongIndicators = songIndicators.some(indicator => 
          part2.toLowerCase().includes(indicator)
        );

        if (part2HasSongIndicators && !part1HasSongIndicators) {
          cleanedTitle = part2.trim();
          cleanedArtist = part1.trim();
        } else if (!part2HasSongIndicators && part1HasSongIndicators) {
          cleanedTitle = part1.trim();
          cleanedArtist = part2.trim();
        } else {
          // Default: assume first part is song, second is artist
          cleanedTitle = part1.trim();
          cleanedArtist = part2.trim();
        }
        break;
      }
    }
  }

  // Final cleanup
  cleanedTitle = cleanedTitle.trim().replace(/\s+/g, ' ');
  cleanedArtist = cleanedArtist.trim().replace(/\s+/g, ' ');

  // Fallback if cleaning resulted in empty strings
  if (!cleanedTitle) cleanedTitle = title;
  if (!cleanedArtist) cleanedArtist = channelTitle;

  return {
    trackName: cleanedTitle,
    artistName: cleanedArtist,
  };
};