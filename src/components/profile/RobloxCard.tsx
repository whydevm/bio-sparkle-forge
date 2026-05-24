import { useEffect, useState } from "react";
import { SiRoblox } from "react-icons/si";
import { FaUsers, FaUserPlus } from "react-icons/fa";

interface RobloxCardProps {
  identifier: string; // username or numeric ID
  globalRadius?: number;
}

interface RobloxData {
  id: number;
  name: string;
  displayName: string;
  avatarUrl: string;
  friends: number;
  followers: number;
}

const RobloxCard = ({ identifier, globalRadius = 50 }: RobloxCardProps) => {
  const [data, setData] = useState<RobloxData | null>(null);
  const [loading, setLoading] = useState(true);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // roproxy.com is a CORS-enabled mirror of Roblox APIs
        let userId: number | null = null;
        let displayName = "";
        let name = "";

        if (/^\d+$/.test(identifier)) {
          userId = parseInt(identifier, 10);
          const r = await fetch(`https://users.roproxy.com/v1/users/${userId}`);
          if (r.ok) {
            const j = await r.json();
            displayName = j.displayName;
            name = j.name;
          }
        } else {
          const r = await fetch(`https://users.roproxy.com/v1/usernames/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [identifier], excludeBannedUsers: false }),
          });
          if (r.ok) {
            const j = await r.json();
            if (j.data?.[0]) {
              userId = j.data[0].id;
              displayName = j.data[0].displayName;
              name = j.data[0].name;
            }
          }
        }

        if (!userId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const [friendsR, followersR, avatarR] = await Promise.all([
          fetch(`https://friends.roproxy.com/v1/users/${userId}/friends/count`),
          fetch(`https://friends.roproxy.com/v1/users/${userId}/followers/count`),
          fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png`),
        ]);

        const friends = friendsR.ok ? (await friendsR.json()).count ?? 0 : 0;
        const followers = followersR.ok ? (await followersR.json()).count ?? 0 : 0;
        const avatarJson = avatarR.ok ? await avatarR.json() : null;
        const avatarUrl = avatarJson?.data?.[0]?.imageUrl ?? "";

        if (!cancelled) {
          setData({ id: userId, name, displayName: displayName || name, avatarUrl, friends, followers });
        }
      } catch (e) {
        console.error("Roblox card error", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [identifier]);

  if (loading) {
    return (
      <div
        className="font-ggsans flex items-center gap-3 p-4 border border-white/10 backdrop-blur-sm animate-pulse"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="w-24 h-4 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="font-ggsans flex items-center gap-3 p-4 border border-white/10 backdrop-blur-sm"
        style={{ borderRadius }}
      >
        <SiRoblox className="w-6 h-6 text-white/60" />
        <span className="text-sm text-white/60">@{identifier} not found on Roblox</span>
      </div>
    );
  }

  return (
    <div
      className="font-ggsans flex items-center gap-3 p-4 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all"
      style={{ borderRadius }}
    >
      {data.avatarUrl ? (
        <img
          src={data.avatarUrl}
          alt={data.displayName}
          className="w-14 h-14 object-cover flex-shrink-0 bg-white/5"
          style={{ borderRadius: `${Math.round((globalRadius / 100) * 16)}px` }}
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <SiRoblox className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">{data.displayName}</div>
        <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
          <span className="flex items-center gap-1">
            <FaUsers className="w-3 h-3" /> {data.friends} Friends
          </span>
          <span className="flex items-center gap-1">
            <FaUserPlus className="w-3 h-3" /> {data.followers} Followers
          </span>
        </div>
        <a
          href={`https://www.roblox.com/users/${data.id}/profile`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-3 py-1 text-xs rounded-full border border-white/30 hover:bg-white/10 text-white transition-all"
        >
          View Player
        </a>
      </div>
      <div className="text-xs text-white/60 flex items-center gap-1 flex-shrink-0">
        <SiRoblox className="w-4 h-4" />
        Roblox
      </div>
    </div>
  );
};

export default RobloxCard;
