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
}

const SocialLinks = ({ links, glow }: SocialLinksProps) => {
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
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button
            variant="outline"
            className={`w-full justify-start gap-3 ${glow ? "glow-border" : ""}`}
          >
            {link.custom_icon_url ? (
              <img src={link.custom_icon_url} alt="" className="w-5 h-5 object-contain" />
            ) : (
              getIcon(link.platform)
            )}
            <span>{link.label}</span>
          </Button>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;