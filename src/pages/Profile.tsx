import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileUsername from "@/components/profile/ProfileUsername";
import SocialLinks from "@/components/profile/SocialLinks";
import MusicPlayer from "@/components/profile/MusicPlayer";
import ViewCounter from "@/components/profile/ViewCounter";
import CustomCursor from "@/components/CustomCursor";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [music, setMusic] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
      incrementViewCount();
    }
  }, [username]);

  useEffect(() => {
    // Auto-play video when profile loads or updates
    if (videoRef.current && profile?.background_type === "video") {
      const playVideo = async () => {
        try {
          videoRef.current!.muted = false;
          await videoRef.current!.play();
        } catch (error) {
          console.log("Autoplay prevented:", error);
        }
      };
      playVideo();
    }
  }, [profile]);

  const loadProfile = async () => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (profileData) {
      setProfile(profileData);

      const { data: musicData } = await supabase
        .from("profile_music")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("order_index");

      const { data: linksData } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("order_index");

      setMusic(musicData || []);
      setLinks(linksData || []);
    }
    setLoading(false);
  };

  const incrementViewCount = async () => {
    await supabase.rpc("increment_view_count", { profile_username: username });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Profile not found</h1>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    if (!profile.background_url) return {};

    if (profile.background_type === "video") {
      return {};
    }

    return {
      backgroundImage: `url(${profile.background_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const profileOpacity = profile.profile_opacity / 100;
  const profileBlur = profile.profile_blur;

  return (
    <div className="min-h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      <CustomCursor cursorUrl={profile.custom_cursor} />
      
      {profile.background_type === "video" && profile.background_url && (
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={profile.background_url} type="video/mp4" />
        </video>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md"
          style={{
            opacity: profileOpacity === 0 ? 0 : 1,
          }}
        >
          <div
            className={`glass-panel p-8 rounded-2xl space-y-6 ${
              profile.border_enabled && profileOpacity > 0 ? "glow-border" : ""
            }`}
            style={{
              backdropFilter: `blur(${profileBlur}px)`,
            }}
          >
            <ProfileAvatar
              avatarUrl={profile.avatar_url}
              decorationUrl={profile.avatar_decoration_url}
              displayName={profile.display_name || profile.username}
            />

            <div className="text-center">
              <ProfileUsername
                username={profile.display_name || profile.username}
                effect={profile.username_effect}
                glow={profile.glow_username}
              />
              {profile.bio && (
                <p className="text-muted-foreground mt-2">{profile.bio}</p>
              )}
            </div>

            <SocialLinks links={links} glow={profile.glow_socials} />

            {music.length > 0 && <MusicPlayer music={music} />}
          </div>
        </div>
      </div>

      <ViewCounter count={profile.view_count} />
    </div>
  );
};

export default Profile;