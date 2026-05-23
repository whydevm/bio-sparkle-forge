import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Reaction = "like" | "dislike" | null;

export const useProfileLikes = (profileId: string | undefined) => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [myReaction, setMyReaction] = useState<Reaction>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profileId) return;
    const { data } = await supabase
      .from("profile_likes")
      .select("user_id, reaction")
      .eq("profile_id", profileId);
    if (data) {
      setLikes(data.filter(r => r.reaction === "like").length);
      setDislikes(data.filter(r => r.reaction === "dislike").length);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id ?? null;
      setUserId(uid);
      const mine = data.find(r => r.user_id === uid);
      setMyReaction((mine?.reaction as Reaction) ?? null);
    }
  }, [profileId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const react = useCallback(
    async (reaction: "like" | "dislike") => {
      if (!profileId) return { ok: false, reason: "no-profile" as const };
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return { ok: false, reason: "not-signed-in" as const };

      if (myReaction === reaction) {
        // Toggle off
        await supabase
          .from("profile_likes")
          .delete()
          .eq("profile_id", profileId)
          .eq("user_id", uid);
      } else {
        await supabase
          .from("profile_likes")
          .upsert(
            { profile_id: profileId, user_id: uid, reaction },
            { onConflict: "profile_id,user_id" }
          );
      }
      await refresh();
      return { ok: true as const };
    },
    [profileId, myReaction, refresh]
  );

  return { likes, dislikes, myReaction, react, isSignedIn: !!userId };
};
