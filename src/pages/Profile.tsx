import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileUsername from "@/components/profile/ProfileUsername";
import SocialLinks from "@/components/profile/SocialLinks";
import MusicPlayer from "@/components/profile/MusicPlayer";
import ViewCounter from "@/components/profile/ViewCounter";
import CustomCursor from "@/components/CustomCursor";
import EntrySplash from "@/components/EntrySplash";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [music, setMusic] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
      incrementViewCount();
    }
  }, [username]);

  useEffect(() => {
    // Auto-play media when user enters
    if (hasEntered && profile) {
      // If we have music, mute the video background
      if (videoRef.current && profile.background_type === "video") {
        const playVideo = async () => {
          try {
            videoRef.current!.muted = music.length > 0; // Mute if we have music
            await videoRef.current!.play();
          } catch (error) {
            console.log("Autoplay prevented:", error);
          }
        };
        playVideo();
      }
      
      if (audioRef.current && music.length > 0) {
        const playAudio = async () => {
          try {
            await audioRef.current!.play();
          } catch (error) {
            console.log("Autoplay prevented:", error);
          }
        };
        playAudio();
      }
    }
  }, [hasEntered, profile, music]);

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
  const showBorder = profileOpacity > 0;
  
  const hasAudio = music.length > 0 || profile.background_type === "video";
  const shouldShowSplash = hasAudio && !hasEntered;

  return (
    <>
      {shouldShowSplash && (
        <EntrySplash
          entryText={profile.entry_text || "Click to Enter"}
          entryTextFont={profile.entry_text_font || "font-sans"}
          onEnter={() => setHasEntered(true)}
          hasAudio={hasAudio}
        />
      )}
      
      <div className="min-h-screen relative overflow-hidden" style={getBackgroundStyle()}>
        <CustomCursor cursorUrl={profile.custom_cursor} />
        
        {profile.background_type === "video" && profile.background_url && (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={profile.background_url} type="video/mp4" />
          </video>
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div
              className="glass-panel p-8 rounded-2xl space-y-6"
              style={{
                backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
                backgroundColor: profileOpacity === 0 ? "transparent" : undefined,
                borderColor: showBorder ? undefined : "transparent",
              }}
            >
              {/* Profile Avatar - Circular, centered, no glow */}
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24">
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                  {profile.avatar_decoration_url && (
                    <img
                      src={profile.avatar_decoration_url}
                      alt="decoration"
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
              </div>

              <div className="text-center">
                <ProfileUsername
                  username={profile.display_name || profile.username}
                  effect={profile.username_effect}
                  glow={profile.glow_username}
                  fontClass={profile.display_name_font}
                  colorClass={profile.display_name_color}
                />
                {profile.bio && (
                  <p className={`mt-2 ${profile.bio_font} ${profile.bio_color}`}>{profile.bio}</p>
                )}
              </div>

              <SocialLinks
                links={links}
                glow={profile.glow_socials}
                monochrome={profile.monochrome_icons}
              />
            </div>

            {music.length > 0 && profile.show_audio_player !== false && (
              <div 
                className="rounded-2xl p-3"
                style={{
                  backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
                  backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
                  borderWidth: profileOpacity === 0 ? "0" : "1px",
                  borderColor: profileOpacity === 0 ? "transparent" : "hsl(var(--border))",
                }}
              >
                <MusicPlayer music={music} audioRef={audioRef} shuffle={profile.audio_shuffle} />
              </div>
            )}
          </div>
        </div>

        {/* Views in bottom left */}
        {hasEntered && (
          <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
            <div 
              className="px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
              style={{
                backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
                borderWidth: profileOpacity === 0 ? "0" : "1px",
                borderColor: profileOpacity === 0 ? "transparent" : "hsl(var(--border))",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{profile.view_count.toLocaleString()}</span>
            </div>

            {profile.location && (
              <div 
                className="px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
                style={{
                  backgroundColor: profileOpacity === 0 ? "transparent" : "hsl(var(--card) / 0.8)",
                  borderWidth: profileOpacity === 0 ? "0" : "1px",
                  borderColor: profileOpacity === 0 ? "transparent" : "hsl(var(--border))",
                }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{profile.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;