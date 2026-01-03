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
import CodingBadges from "@/components/profile/CodingBadges";
import ProjectsSection from "@/components/profile/ProjectsSection";
import BackgroundEffects from "@/components/profile/BackgroundEffects";
import SocialCards from "@/components/profile/SocialCards";
import ProfileBadges from "@/components/profile/ProfileBadges";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [music, setMusic] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("order_index");

      setMusic(musicData || []);
      setLinks(linksData || []);
      setProjects(projectsData || []);
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
  // Normalize legacy themes to new ones
  const normalizedTheme = profile.theme === "default" || profile.theme === "minimal" || profile.theme === "neon" 
    ? "basic" 
    : profile.theme;
  const isPortfolioTheme = normalizedTheme === "portfolio";
  
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
        
        {/* Background Effects */}
        {profile.background_effect && profile.background_effect !== "none" && (
          <BackgroundEffects effect={profile.background_effect} />
        )}
        
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
          <div className="w-full max-w-md space-y-6 flex flex-col items-center">
            <div
              className="glass-panel p-8 rounded-2xl space-y-6 w-full"
              style={{
                backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
                backgroundColor: profileOpacity === 0 ? "transparent" : undefined,
                borderColor: showBorder ? undefined : "transparent",
              }}
            >
              {/* Profile Avatar - Larger and more centered */}
              <div className="flex justify-center mb-8">
                <div className="relative w-36 h-36 md:w-44 md:h-44">
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      className="w-full h-full rounded-full object-cover ring-4 ring-white/20"
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
                  customColor={profile.display_name_color?.startsWith('#') ? profile.display_name_color : undefined}
                />
                
                {/* Profile Badges - Under username, above bio */}
                <ProfileBadges userId={profile.user_id} />
                
                {bioTexts.length > 0 && (showContent || !hasAudio) && (
                  <p 
                    className={`mt-3 ${profile.bio_font}`}
                    style={{ color: profile.bio_color?.startsWith('#') ? profile.bio_color : undefined }}
                  >
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

              {/* Social Links - Larger icons */}
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

            {/* Scroll indicator - Larger and more prominent */}
            {isPortfolioTheme && hasAboutMe && (showContent || !hasAudio) && (
              <ScrollIndicator text={profile.scroll_text || "scroll for more"} />
            )}
          </div>
        </div>

        {/* About Me Section - available on all themes */}
        {hasAboutMe && (
          <AboutMeSection
            aboutMe={profile.about_me}
            profileOpacity={profile.profile_opacity}
            profileBlur={profileBlur}
            titleColor={profile.display_name_color?.startsWith('#') ? profile.display_name_color : undefined}
            textColor={profile.bio_color?.startsWith('#') ? profile.bio_color : undefined}
          />
        )}

        {/* Social Cards - only for portfolio theme */}
        {isPortfolioTheme && profile && (showContent || !hasAudio) && (
          <div className="relative z-10 px-8 pb-4">
            <SocialCards profileId={profile.id} theme={profile.theme} />
          </div>
        )}
        
        {/* Coding Badges Section - only for portfolio theme */}
        {isPortfolioTheme && profile.coding_badges && profile.coding_badges.length > 0 && (showContent || !hasAudio) && (
          <div className="relative z-10 flex justify-center px-8 pb-8">
            <div className="max-w-md">
              <CodingBadges badges={profile.coding_badges} glow={profile.glow_badges} />
            </div>
          </div>
        )}

        {/* Projects - only for portfolio theme - NOW AFTER CODING BADGES */}
        {isPortfolioTheme && projects && projects.length > 0 && (showContent || !hasAudio) && (
          <div className="relative z-10">
            <ProjectsSection 
              projects={projects} 
              title={profile.projects_title}
              description={profile.projects_description}
            />
          </div>
        )}

        {/* Stats in bottom left */}
        {(hasEntered || !hasAudio) && (showContent || !hasAudio) && (
          <ProfileStats
            viewCount={profile.view_count || 0}
            location={profile.location}
            createdAt={profile.created_at}
            profileOpacity={profile.profile_opacity}
            showViews={profile.show_views ?? true}
            showJoinDate={profile.show_join_date ?? true}
            showLikes={profile.show_likes ?? true}
            viewsAnimation={profile.views_animation ?? true}
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
