import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileUsername from "@/components/profile/ProfileUsername";
import SocialLinks from "@/components/profile/SocialLinks";
import MusicPlayer from "@/components/profile/MusicPlayer";
import CustomCursor from "@/components/CustomCursor";
import EntrySplash from "@/components/EntrySplash";
import TypewriterText from "@/components/profile/TypewriterText";
import ScrollIndicator from "@/components/profile/ScrollIndicator";
import AboutMeSection from "@/components/profile/AboutMeSection";
import AudioToggle from "@/components/profile/AudioToggle";
import ProfileStats from "@/components/profile/ProfileStats";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [music, setMusic] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
      incrementViewCount();
    }
  }, [username]);

  useEffect(() => {
    if (hasEntered) {
      const timeout = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [hasEntered]);

  useEffect(() => {
    if (hasEntered && profile) {
      if (videoRef.current && profile.background_type === "video") {
        const playVideo = async () => {
          try {
            videoRef.current!.muted = music.length > 0;
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
      backgroundAttachment: profile.about_me ? "fixed" : undefined,
    };
  };

  const profileOpacity = profile.profile_opacity / 100;
  const profileBlur = profile.profile_blur;
  const showBorder = profileOpacity > 0;
  
  const hasAudio = music.length > 0 || profile.background_type === "video";
  const shouldShowSplash = hasAudio && !hasEntered;
  const hasAboutMe = profile.about_me && profile.about_me.trim().length > 0;
  
  // Parse bio texts - support multiple lines for looping typewriter
  const bioTexts = profile.bio ? profile.bio.split("\n").filter((t: string) => t.trim()) : [];
  const cyclingEnabled = profile.cycling_bio_enabled ?? false;

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
      
      <div className="min-h-screen relative" style={getBackgroundStyle()}>
        <CustomCursor cursorUrl={profile.custom_cursor} />
        
        {profile.background_type === "video" && profile.background_url && (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover"
          >
            <source src={profile.background_url} type="video/mp4" />
          </video>
        )}

        {/* Audio toggle button in top left when player is hidden */}
        {music.length > 0 && profile.show_audio_player === false && (hasEntered || !hasAudio) && (
          <div className="fixed top-6 left-6 z-50">
            <AudioToggle audioRef={audioRef} />
          </div>
        )}

        <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-4 transition-opacity duration-700 ${
          shouldShowSplash ? "opacity-0" : showContent || !hasAudio ? "opacity-100" : "opacity-0"
        }`}>
          <div className="w-full max-w-md space-y-4">
            <div
              className="glass-panel p-8 rounded-2xl space-y-6"
              style={{
                backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
                backgroundColor: profileOpacity === 0 ? "transparent" : undefined,
                borderColor: showBorder ? undefined : "transparent",
              }}
            >
              {/* Profile Avatar */}
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
                {bioTexts.length > 0 && (showContent || !hasAudio) && (
                  <p className={`mt-2 ${profile.bio_font} ${profile.bio_color}`}>
                    {cyclingEnabled ? (
                      <TypewriterText 
                        texts={bioTexts} 
                        typingSpeed={100} 
                        deletingSpeed={50}
                        pauseDuration={2500}
                        enableCycling={true}
                      />
                    ) : (
                      <TypewriterText 
                        texts={[bioTexts[0]]} 
                        typingSpeed={100} 
                        deletingSpeed={50}
                        pauseDuration={2500}
                        enableCycling={false}
                      />
                    )}
                  </p>
                )}
              </div>

              <SocialLinks
                links={links}
                glow={profile.glow_socials}
                monochrome={profile.monochrome_icons}
              />
            </div>

            {/* Music player below bio */}
            {music.length > 0 && profile.show_audio_player !== false && (
              <MusicPlayer music={music} audioRef={audioRef} shuffle={profile.audio_shuffle} />
            )}

            {/* Scroll indicator if about me exists */}
            {hasAboutMe && (showContent || !hasAudio) && <ScrollIndicator />}
          </div>
        </div>

        {/* About Me Section */}
        {hasAboutMe && (
          <AboutMeSection
            aboutMe={profile.about_me}
            profileOpacity={profile.profile_opacity}
            profileBlur={profileBlur}
          />
        )}

        {/* Stats in bottom left */}
        {(hasEntered || !hasAudio) && (showContent || !hasAudio) && (
          <ProfileStats
            viewCount={profile.view_count || 0}
            location={profile.location}
            createdAt={profile.created_at}
            profileOpacity={profile.profile_opacity}
          />
        )}
      </div>

      {/* Hidden audio element for when player is hidden */}
      {music.length > 0 && profile.show_audio_player === false && (
        <audio
          ref={audioRef}
          src={music[0]?.url}
          loop={music.length === 1}
        />
      )}
    </>
  );
};

export default Profile;
