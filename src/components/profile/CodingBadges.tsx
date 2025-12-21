import { 
  SiReact, 
  SiPython, 
  SiRuby, 
  SiTailwindcss, 
  SiTypescript, 
  SiNextdotjs, 
  SiJavascript, 
  SiNodedotjs, 
  SiVuedotjs, 
  SiAngular, 
  SiSvelte, 
  SiGo, 
  SiRust, 
  SiCplusplus, 
  SiPhp, 
  SiSwift, 
  SiKotlin, 
  SiFlutter 
} from "react-icons/si";
import { VscJson } from "react-icons/vsc";

interface CodingBadgesProps {
  badges: string[];
}

const BADGE_CONFIG: Record<string, { label: string; Icon: React.ElementType }> = {
  react: { label: "React", Icon: SiReact },
  python: { label: "Python", Icon: SiPython },
  ruby: { label: "Ruby", Icon: SiRuby },
  tailwind: { label: "Tailwind", Icon: SiTailwindcss },
  typescript: { label: "TypeScript", Icon: SiTypescript },
  nextjs: { label: "Next.js", Icon: SiNextdotjs },
  javascript: { label: "JavaScript", Icon: SiJavascript },
  nodejs: { label: "Node.js", Icon: SiNodedotjs },
  vue: { label: "Vue.js", Icon: SiVuedotjs },
  angular: { label: "Angular", Icon: SiAngular },
  svelte: { label: "Svelte", Icon: SiSvelte },
  go: { label: "Go", Icon: SiGo },
  rust: { label: "Rust", Icon: SiRust },
  cpp: { label: "C++", Icon: SiCplusplus },
  php: { label: "PHP", Icon: SiPhp },
  swift: { label: "Swift", Icon: SiSwift },
  kotlin: { label: "Kotlin", Icon: SiKotlin },
  flutter: { label: "Flutter", Icon: SiFlutter },
  json: { label: "JSON", Icon: VscJson },
};

const CodingBadges = ({ badges }: CodingBadgesProps) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {badges.map((badgeKey) => {
        const config = BADGE_CONFIG[badgeKey];
        if (!config) return null;
        const { label, Icon } = config;
        
        return (
          <div
            key={badgeKey}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm"
          >
            <Icon className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export { BADGE_CONFIG };
export default CodingBadges;