
import {
  SiTiktok,
  SiInstagram,
  SiX,
  SiDiscord,
  SiGithub,
  SiSnapchat,
  SiYoutube,
  SiTwitch,
  SiSpotify,
} from "react-icons/si";

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  custom_icon_url?: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  glow?: boolean;
  monochrome?: boolean;
}

const SocialLinks = ({ links, glow, monochrome }: SocialLinksProps) => {
  const getIcon = (platform: string) => {
    const icons: Record<string, any> = {
      tiktok: SiTiktok,
      instagram: SiInstagram,
      twitter: SiX,
      discord: SiDiscord,
      github: SiGithub,
      snapchat: SiSnapchat,
      youtube: SiYoutube,
      twitch: SiTwitch,
      spotify: SiSpotify,
    };

    const IconComponent = icons[platform.toLowerCase()];
    return IconComponent ? <IconComponent className={`w-7 h-7 text-foreground`} /> : null;
  };

  return (
    <div className="flex flex-wrap gap-5 justify-center mt-4">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label || link.platform}
          className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 hover:opacity-70 hover:scale-110 ${
            glow ? "glow-border" : ""
          }`}
        >
          {link.custom_icon_url ? (
            <img
              src={link.custom_icon_url}
              alt={`${link.platform} icon`}
              className={`w-10 h-10 object-contain ${monochrome ? "brightness-0 invert" : ""}`}
              loading="lazy"
            />
          ) : (
            <span className="text-foreground">
              {getIcon(link.platform) ? (
                <span className="[&>svg]:w-10 [&>svg]:h-10">{getIcon(link.platform)}</span>
              ) : null}
            </span>
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;