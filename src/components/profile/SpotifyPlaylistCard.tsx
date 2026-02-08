import { FaSpotify } from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";

interface SpotifyPlaylistCardProps {
  playlistName: string;
  creatorName: string;
  coverUrl?: string;
  trackCount?: number;
  playlistUrl: string;
  globalRadius?: number;
}

const SpotifyPlaylistCard = ({ 
  playlistName, 
  creatorName, 
  coverUrl, 
  trackCount,
  playlistUrl,
  globalRadius = 50 
}: SpotifyPlaylistCardProps) => {
  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  const formatTrackCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div 
      className="font-ggsans flex items-center gap-3 px-4 py-3 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-300"
      style={{ borderRadius }}
    >
      {/* Playlist Cover */}
      <div className="relative flex-shrink-0">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={playlistName}
            className="w-14 h-14 rounded-lg object-cover"
          />
        ) : (
          <div 
            className="w-14 h-14 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#1DB954" }}
          >
            <FaSpotify className="w-7 h-7 text-white" />
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white text-sm truncate">
          {playlistName}
        </p>
        <div className="flex items-center gap-1 text-xs text-white/60">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
          </svg>
          <span>by {creatorName}</span>
          {trackCount !== undefined && (
            <>
              <span>•</span>
              <span>{formatTrackCount(trackCount)} tracks</span>
            </>
          )}
        </div>

        {/* Open Button */}
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 px-3 py-1 text-xs font-medium text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          Open in Spotify
          <HiOutlineExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Spotify Logo */}
      <div className="flex-shrink-0">
        <FaSpotify className="w-6 h-6 text-[#1DB954]" />
      </div>
    </div>
  );
};

export default SpotifyPlaylistCard;
