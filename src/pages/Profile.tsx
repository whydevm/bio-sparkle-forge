import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProfileUsername from "@/components/profile/ProfileUsername";
import SocialLinks from "@/components/profile/SocialLinks";
import MusicPlayer from "@/components/profile/MusicPlayer";
import PremiumMusicPlayer from "@/components/profile/PremiumMusicPlayer";
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
import ReportDialog from "@/components/profile/ReportDialog";
import ParallaxContainer from "@/components/profile/ParallaxContainer";
import { useClickSound } from "@/hooks/useClickSound";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Flag } from "lucide-react";

interface Background {
  id: string;
  url: string;
  type: "image" | "video";
  enabled: boolean;
}

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [music, setMusic] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<{ url: string; type: string } | null>(null);
  const [hasPremiumBadge, setHasPremiumBadge] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Click sounds - support custom sound URL
  useClickSound(profile?.click_sounds ?? false, profile?.click_sound_url);

  // Set page title to username
  useEffect(() => {
    if (profile?.username) {
      document.title = profile.username;
    }
    return () => {
      document.title = "bio-sparkle-forge";
    };
  }, [profile?.username]);

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
      if (videoRef.current && currentBackground?.type === "video") {
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
  }, [hasEntered, profile, music, currentBackground]);

  // Handle background rotation on page load - random on each visit
  useEffect(() => {
    if (profile) {
      const backgrounds = (profile.backgrounds || []) as Background[];
      const enabledBackgrounds = backgrounds.filter(bg => bg.enabled);
      
      if (enabledBackgrounds.length > 1 && profile.background_shuffle) {
        // Random background on each visit
        const randomIndex = Math.floor(Math.random() * enabledBackgrounds.length);
        const selectedBg = enabledBackgrounds[randomIndex];
        setCurrentBackground({ url: selectedBg.url, type: selectedBg.type });
      } else if (enabledBackgrounds.length > 0) {
        // Use first enabled background
        setCurrentBackground({ url: enabledBackgrounds[0].url, type: enabledBackgrounds[0].type });
      } else if (profile.background_url) {
        // Fallback to single background
        setCurrentBackground({ url: profile.background_url, type: profile.background_type || "image" });
      }
    }
  }, [profile]);

  // Check if user has premium badge for premium player
  useEffect(() => {
    const checkPremiumBadge = async () => {
      if (!profile?.user_id) return;
      
      const { data } = await supabase
        .from("user_badges")
        .select(`
          badge_id,
          badges (badge_type)
        `)
        .eq("user_id", profile.user_id);
      
      if (data) {
        const hasPremium = data.some((ub: any) => 
          ub.badges?.badge_type === "premium" || ub.badges?.badge_type === "owner"
        );
        setHasPremiumBadge(hasPremium);
      }
    };
    
    checkPremiumBadge();
  }, [profile?.user_id]);

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

  const handleEnter = () => {
    setHasEntered(true);
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
    if (!currentBackground?.url) return {};

    if (currentBackground.type === "video") {
      return {};
    }

    return {
      backgroundImage: `url(${currentBackground.url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: profile.about_me ? "fixed" : undefined,
    };
  };

  const profileOpacity = profile.profile_opacity / 100;
  const profileBlur = profile.profile_blur;
  const showBorder = profile.border_enabled && profileOpacity > 0;
  
  // Check if video has audio (we assume videos may have audio)
  const videoHasAudio = currentBackground?.type === "video" && currentBackground?.url;
  const hasAudio = music.length > 0 || videoHasAudio;
  const shouldShowSplash = hasAudio && !hasEntered;
  const hasAboutMe = profile.about_me && profile.about_me.trim().length > 0;
  
  // Normalize legacy themes to new ones
  const normalizedTheme = profile.theme === "default" || profile.theme === "minimal" || profile.theme === "neon" 
    ? "basic" 
    : profile.theme;
  const isPortfolioTheme = normalizedTheme === "portfolio";
  const isBasicTheme = normalizedTheme === "basic";
  
  // Parse bio texts - support multiple lines for looping typewriter
  const bioTexts = profile.bio ? profile.bio.split("\n").filter((t: string) => t.trim()) : [];
  const cyclingEnabled = profile.cycling_bio_enabled ?? false;

  // Parallax settings - works at any opacity now
  const parallaxEnabled = isBasicTheme && profile.parallax_enabled;

  // Avatar radius
  const avatarRadius = profile.avatar_radius ?? 100;
  
  // Global radius for badges, social cards, etc.
  const globalRadius = profile.global_radius ?? 50;
  
  // Text color (default white)
  const textColor = profile.text_color || "#FFFFFF";

  // Calculate profile border radius based on global_radius
  const profileBorderRadius = `${Math.round((globalRadius / 100) * 24)}px`;
  
  // Border effect type
  const borderEffect = showBorder ? (profile.border_effect || "default") : "none";

  // Show badges on profile setting
  const showBadgesOnProfile = (profile as any).show_badges_on_profile ?? true;

  // Entry text handling - if empty string, don't show default text
  const getEntryText = () => {
    // If entry_text is undefined or null, return empty string (no text)
    // If it has a value (even just spaces), use it trimmed
    if (profile.entry_text === undefined || profile.entry_text === null || profile.entry_text.trim() === "") {
      return "";
    }
    return profile.entry_text;
  };

  const ProfileContent = () => (
    <div
      className={`p-8 w-full mx-auto ${showBorder && borderEffect === "glass" ? "glass-border-effect" : ""}`}
      style={{
        backdropFilter: profileOpacity === 0 ? "none" : `blur(${profileBlur}px)`,
        backgroundColor: profileOpacity === 0 ? "transparent" : `hsl(var(--card) / ${profileOpacity})`,
        borderWidth: showBorder && borderEffect !== "glass" ? "1px" : "0",
        borderColor: showBorder && borderEffect !== "glass" ? "hsl(var(--border))" : "transparent",
        borderRadius: profileBorderRadius,
        color: textColor,
      }}
    >
      {/* Top section: Avatar on left, username and badges on right */}
      <div className="flex items-start gap-5 mb-5">
        {/* Avatar - Bigger */}
        {profile.avatar_url && (
          <div 
            className="relative flex-shrink-0 w-28 h-28 md:w-32 md:h-32"
            style={{ borderRadius: `${avatarRadius}%` }}
          >
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="w-full h-full object-cover"
              style={{ borderRadius: `${avatarRadius}%` }}
            />
            {profile.avatar_decoration_url && (
              <img
                src={profile.avatar_decoration_url}
                alt="Avatar decoration"
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>
        )}

        {/* Username and Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <ProfileUsername
              username={profile.display_name || profile.username}
              effect={profile.username_effect}
              glow={profile.glow_username}
              fontClass={profile.display_name_font || "font-ggsans"}
              colorClass={profile.display_name_color}
              customColor={profile.display_name_color?.startsWith('#') ? profile.display_name_color : undefined}
            />
            {showBadgesOnProfile && (
              <ProfileBadges 
                userId={profile.user_id} 
                badgeColors={profile.badge_colors}
                inline
                globalRadius={globalRadius}
              />
            )}
          </div>
          
          {/* Bio under username/badges */}
          {bioTexts.length > 0 && (showContent || !hasAudio) && (
            <p 
              className="mt-3 text-sm font-ggsans text-white"
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
      </div>

      {/* Social Cards for basic theme - centered */}
      {isBasicTheme && profile && (showContent || !hasAudio) && (
        <div className="mb-5">
          <SocialCards profileId={profile.id} theme={profile.theme} profileOpacity={profileOpacity} globalRadius={globalRadius} />
        </div>
      )}

      {/* Social Links */}
      <div className="mb-5">
        <SocialLinks
          links={links}
          glow={profile.glow_socials}
          monochrome={profile.monochrome_icons}
          linkColors={profile.link_colors}
        />
      </div>

      {/* Stats inside the border for basic theme - no border line */}
      {isBasicTheme && (hasEntered || !hasAudio) && (showContent || !hasAudio) && (
        <div className="pt-4">
          <ProfileStats
            viewCount={profile.view_count || 0}
            location={profile.location}
            createdAt={profile.created_at}
            profileOpacity={100}
            showViews={profile.show_views ?? true}
            showJoinDate={profile.show_join_date ?? true}
            showLikes={profile.show_likes ?? true}
            viewsAnimation={profile.views_animation ?? true}
            userId={profile.user_id}
            uidNumber={profile.uid_number}
            joinDateFormat={profile.join_date_format || "MMM dd, yyyy"}
            joinTimeFormat={profile.join_time_format || "12h"}
            insideCard
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {shouldShowSplash && (
        <EntrySplash
          entryText={getEntryText()}
          entryTextFont={profile.entry_text_font || "font-ggsans"}
          onEnter={handleEnter}
          hasAudio={!!hasAudio}
          animation={profile.entry_animation || undefined}
          discordEmoji={profile.entry_emoji}
          emojiPosition={profile.entry_emoji_position || "start"}
          backgroundUrl={currentBackground?.url}
          backgroundType={currentBackground?.type}
          showBackground={profile.show_entry_background ?? true}
        />
      )}
      
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="min-h-screen relative pb-24 md:pb-28 cursor-default" style={getBackgroundStyle()}>
        <CustomCursor cursorUrl={profile.custom_cursor} />
        
        {/* Background Effects */}
        {profile.background_effect && profile.background_effect !== "none" && (
          <BackgroundEffects effect={profile.background_effect} />
        )}
        
        {currentBackground?.type === "video" && currentBackground?.url && (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="fixed inset-0 w-full h-full object-cover"
          >
            <source src={currentBackground.url} type="video/mp4" />
          </video>
        )}

        {/* Audio toggle button in top left when player is hidden or when only video has audio */}
        {((music.length > 0 && profile.show_audio_player === false) || (music.length === 0 && videoHasAudio)) && (hasEntered || !hasAudio) && (
          <div className="fixed top-6 left-6 z-50">
            <AudioToggle audioRef={videoHasAudio && music.length === 0 ? videoRef as any : audioRef} profileOpacity={profile.profile_opacity ?? 100} />
          </div>
        )}

        <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-4 pb-28 transition-opacity duration-700 ${
          shouldShowSplash ? "opacity-0" : showContent || !hasAudio ? "opacity-100" : "opacity-0"
        }`}>
          {/* Profile container - BIGGER */}
          <div className="w-full max-w-xl space-y-6 flex flex-col items-center">
            {parallaxEnabled ? (
              <ParallaxContainer
                enabled={true}
                intensity={profile.parallax_intensity || 50}
                inverted={profile.parallax_inverted || false}
              >
                <ProfileContent />
              </ParallaxContainer>
            ) : (
              <ProfileContent />
            )}

            {/* Music player - Sticky option or Premium bottom player */}
            {music.length > 0 && profile.show_audio_player !== false && (
              <>
                {hasPremiumBadge ? (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40">
                    <PremiumMusicPlayer 
                      music={music} 
                      audioRef={audioRef} 
                      shuffle={profile.audio_shuffle}
                      profileOpacity={profile.profile_opacity ?? 100}
                      globalRadius={globalRadius}
                    />
                  </div>
                ) : (
                  <div className={profile.audio_sticky ? "fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40" : ""}>
                    <MusicPlayer music={music} audioRef={audioRef} shuffle={profile.audio_shuffle} />
                  </div>
                )}
              </>
            )}

            {/* Scroll indicator - Larger and more prominent */}
            {isPortfolioTheme && hasAboutMe && (showContent || !hasAudio) && (
              <ScrollIndicator text={profile.scroll_text || "scroll for more"} />
            )}
          </div>
        </div>

        {/* About Me Section - only for portfolio theme (basic theme shows it in the card) */}
        {isPortfolioTheme && hasAboutMe && (
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
            <SocialCards profileId={profile.id} theme={profile.theme} profileOpacity={profileOpacity} globalRadius={globalRadius} />
          </div>
        )}
        
        {/* Coding Badges Section - only for portfolio theme */}
        {isPortfolioTheme && profile.coding_badges && profile.coding_badges.length > 0 && (showContent || !hasAudio) && (
          <div className="relative z-10 flex justify-center px-8 pb-8">
            <div className="max-w-md">
              <CodingBadges badges={profile.coding_badges} glow={profile.glow_badges} globalRadius={globalRadius} />
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

        {/* Stats in bottom left - only for portfolio theme */}
        {isPortfolioTheme && (hasEntered || !hasAudio) && (showContent || !hasAudio) && (
          <ProfileStats
            viewCount={profile.view_count || 0}
            location={profile.location}
            createdAt={profile.created_at}
            profileOpacity={profile.profile_opacity}
            showViews={profile.show_views ?? true}
            showJoinDate={profile.show_join_date ?? true}
            showLikes={profile.show_likes ?? true}
            viewsAnimation={profile.views_animation ?? true}
            joinDateFormat={profile.join_date_format || "MMM dd, yyyy"}
            joinTimeFormat={profile.join_time_format || "12h"}
          />
        )}

          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setReportDialogOpen(true)} className="text-destructive gap-2">
            <Flag className="w-4 h-4" />
            Report Profile
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Report Dialog */}
      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        profileId={profile.id}
        profileUsername={profile.username}
      />

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