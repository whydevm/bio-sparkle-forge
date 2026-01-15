import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

interface ValorantCardProps {
  username: string;
  tag: string;
  rank?: string;
  level?: number;
  rankIcon?: string;
}

// Rank icons mapping
const RANK_ICONS: Record<string, string> = {
  "iron": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/2.png",
  "bronze": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/5.png",
  "silver": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/8.png",
  "gold": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/11.png",
  "platinum": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/14.png",
  "diamond": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/17.png",
  "ascendant": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/20.png",
  "immortal": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/23.png",
  "radiant": "https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/24.png",
};

const getRankIcon = (rank: string) => {
  const rankLower = rank.toLowerCase();
  for (const [key, url] of Object.entries(RANK_ICONS)) {
    if (rankLower.includes(key)) return url;
  }
  return RANK_ICONS.iron;
};

const ValorantCard = ({ username, tag, rank = "Ascendant 3", level = 291, rankIcon }: ValorantCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock match history data
  const matchHistory = [
    { map: "Icebox", result: "Unrated", elo: 0, eloChange: 0, date: "12.02.2024, 01:58" },
    { map: "Breeze", result: "Unrated", elo: 0, eloChange: 0, date: "12.02.2024, 01:28" },
    { map: "Lotus", result: "Unrated", elo: 0, eloChange: 0, date: "12.02.2024, 00:46" },
    { map: "Split", result: "Diamond 3", elo: 1757, eloChange: 20, date: "30.10.2023, 15:30" },
    { map: "Sunset", result: "Diamond 3", elo: 1737, eloChange: 22, date: "30.10.2023, 15:00" },
  ];

  const displayRankIcon = rankIcon || getRankIcon(rank);
  const trackerUrl = `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(username)}%23${encodeURIComponent(tag)}`;

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(trackerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Valorant Card - Compact display */}
      <div
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md hover:border-white/20 hover:bg-black/40 transition-all duration-300 cursor-pointer group"
      >
        {/* Rank Icon */}
        <div className="w-12 h-12 flex-shrink-0">
          <img 
            src={displayRankIcon} 
            alt={rank}
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate font-ggsans">
              {username}#{tag}
            </span>
            {/* Valorant Logo */}
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 4.5L12.5 20.5L14 18V8L2 4.5Z"/>
              <path d="M22 4.5L12.5 20.5L11 18V8L22 4.5Z" opacity="0.5"/>
            </svg>
            <span className="text-xs text-red-500 font-medium font-ggsans">Valorant</span>
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-1 text-xs text-white/60 font-ggsans">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {rank}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Level {level}
            </span>
          </div>
        </div>

        {/* View Profile Button */}
        <button 
          onClick={handleViewProfile}
          className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 text-white font-ggsans"
        >
          View Profile
        </button>
      </div>

      {/* Match History Dialog - unscrollable */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-xl border-white/10 overflow-hidden max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 4.5L12.5 20.5L14 18V8L2 4.5Z"/>
                <path d="M22 4.5L12.5 20.5L11 18V8L22 4.5Z" opacity="0.5"/>
              </svg>
              <div>
                <div className="font-bold text-lg text-white font-ggsans">Valorant Match History - {username}#{tag}</div>
                <div className="text-sm text-white/60 font-normal font-ggsans">
                  Here you can see the match history and MMR changes from this user.
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {matchHistory.map((match, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {/* Rank icon for the match */}
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {match.result === "Unrated" ? (
                      <span className="text-white/60 text-lg">?</span>
                    ) : (
                      <img 
                        src={getRankIcon(match.result)} 
                        alt={match.result}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white font-ggsans">{match.result}</div>
                    <div className="text-xs text-white/60 font-ggsans">{match.map}</div>
                    <div className="text-xs text-white/40 mt-0.5 font-ggsans">
                      Season ec876e6c-43e8-fa63-ffc1-2e8d4db25525
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold font-ggsans ${match.eloChange > 0 ? "text-green-500" : match.eloChange < 0 ? "text-red-500" : "text-white/60"}`}>
                    {match.eloChange > 0 ? `↑ +${match.eloChange}` : match.eloChange < 0 ? `↓ ${match.eloChange}` : "— 0"}
                  </div>
                  <div className="text-xs text-white/60 font-ggsans">{match.elo} ELO</div>
                  <div className="text-xs text-white/40 mt-0.5 font-ggsans">{match.date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* View Profile Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleViewProfile}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors font-ggsans"
            >
              View Full Profile on Tracker.gg
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ValorantCard;