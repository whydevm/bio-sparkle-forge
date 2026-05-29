import ProfileUsername from "./ProfileUsername";
import ProfileBadges from "./ProfileBadges";
import SocialLinks from "./SocialLinks";
import TypewriterText from "./TypewriterText";

interface PortfolioLayoutProps {
  profile: any;
  links: any[];
  showContent: boolean;
  hasAudio: boolean;
  avatarRadius: number;
  globalRadius: number;
  textColor: string;
  showBadgesOnProfile: boolean;
}

const PortfolioLayout = ({
  profile,
  links,
  showContent,
  hasAudio,
  avatarRadius,
  globalRadius,
  textColor,
  showBadgesOnProfile,
}: PortfolioLayoutProps) => {
  const bioTexts = profile.bio ? profile.bio.split("\n").filter((t: string) => t.trim()) : [];
  const cyclingEnabled = profile.cycling_bio_enabled ?? false;

  return (
    <div
      className="flex flex-col items-center text-center gap-5"
      style={{ color: textColor }}
    >
      {/* Centered Avatar with Decoration */}
      {profile.avatar_url && (
        <div className="relative flex-shrink-0 w-36 h-36 md:w-44 md:h-44">
          <img
            src={profile.avatar_url}
            alt={profile.display_name || profile.username}
            className="w-full h-full object-cover ring-1 ring-white/10"
            style={{ borderRadius: `${avatarRadius}%` }}
          />
          {profile.avatar_decoration_url && (
            <img
              src={profile.avatar_decoration_url}
              alt="Avatar decoration"
              className="absolute pointer-events-none"
              style={{
                width: "140%",
                height: "140%",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
      )}

      {/* Username */}
      <ProfileUsername
        username={profile.display_name || profile.username}
        effect={profile.username_effect}
        glow={profile.glow_username}
        fontClass={profile.display_name_font || "font-ggsans"}
        colorClass={profile.display_name_color}
        customColor={profile.display_name_color?.startsWith("#") ? profile.display_name_color : undefined}
        uidNumber={profile.uid_number}
      />

      {/* Badges */}
      {showBadgesOnProfile && (
        <div className="flex justify-center">
          <ProfileBadges
            userId={profile.user_id}
            badgeColors={profile.badge_colors}
            inline={false}
            globalRadius={globalRadius}
          />
        </div>
      )}

      {/* Bio */}
      {bioTexts.length > 0 && (showContent || !hasAudio) && (
        <p
          className="text-sm font-ggsans text-white/80 max-w-md"
          style={{ color: profile.bio_color?.startsWith("#") ? profile.bio_color : undefined }}
        >
          {cyclingEnabled ? (
            <TypewriterText texts={bioTexts} typingSpeed={100} deletingSpeed={50} pauseDuration={2500} enableCycling />
          ) : (
            <TypewriterText texts={[bioTexts[0]]} typingSpeed={100} deletingSpeed={50} pauseDuration={2500} enableCycling={false} />
          )}
        </p>
      )}

      {/* Social Links */}
      <div className="flex justify-center pt-1">
        <SocialLinks
          links={links}
          glow={profile.glow_socials}
          monochrome={profile.monochrome_icons}
          linkColors={profile.link_colors}
        />
      </div>
    </div>
  );
};

export default PortfolioLayout;
