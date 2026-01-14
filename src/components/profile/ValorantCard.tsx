import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Trophy } from "lucide-react";

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

  return (
    <>
      {/* Valorant Card - Compact display */}
      <div
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-background/30 backdrop-blur-md hover:border-foreground/20 hover:bg-background/40 transition-all duration-300 cursor-pointer group"
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
            <span className="font-semibold text-foreground truncate">
              {username}#{tag}
            </span>
            {/* Valorant Logo */}
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 4.5L12.5 20.5L14 18V8L2 4.5Z"/>
              <path d="M22 4.5L12.5 20.5L11 18V8L22 4.5Z" opacity="0.5"/>
            </svg>
            <span className="text-xs text-red-500 font-medium">Valorant</span>
          </div>
          
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
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
        <button className="px-3 py-1.5 text-xs font-medium bg-foreground/10 hover:bg-foreground/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
          View Profile
        </button>
      </div>

      {/* Match History Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 4.5L12.5 20.5L14 18V8L2 4.5Z"/>
                <path d="M22 4.5L12.5 20.5L11 18V8L22 4.5Z" opacity="0.5"/>
              </svg>
              <div>
                <div className="font-bold text-lg">Valorant Match History - {username}#{tag}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Here you can see the match history and MMR changes from this user.
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {matchHistory.map((match, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border border-foreground/10 bg-background/30"
              >
                <div className="flex items-center gap-3">
                  {/* Rank icon for the match */}
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    {match.result === "Unrated" ? (
                      <span className="text-muted-foreground text-lg">?</span>
                    ) : (
                      <img 
                        src={getRankIcon(match.result)} 
                        alt={match.result}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-semibold">{match.result}</div>
                    <div className="text-xs text-muted-foreground">{match.map}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Season ec876e6c-43e8-fa63-ffc1-2e8d4db25525
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${match.eloChange > 0 ? "text-green-500" : match.eloChange < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {match.eloChange > 0 ? `↑ +${match.eloChange}` : match.eloChange < 0 ? `↓ ${match.eloChange}` : "— 0"}
                  </div>
                  <div className="text-xs text-muted-foreground">{match.elo} ELO</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{match.date}</div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ValorantCard;
