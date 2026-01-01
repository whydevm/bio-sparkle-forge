import { Button } from "@/components/ui/button";
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
    return IconComponent ? <IconComponent className={`w-7 h-7 ${monochrome ? "text-white" : ""}`} /> : null;
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center p-2 rounded-lg transition-opacity hover:opacity-70 ${
            glow ? "glow-border" : ""
          }`}
        >
          {link.custom_icon_url ? (
            <img
              src={link.custom_icon_url}
              alt=""
              className={`w-7 h-7 object-contain ${monochrome ? "brightness-0 invert" : ""}`}
            />
          ) : (
            getIcon(link.platform)
          )}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;