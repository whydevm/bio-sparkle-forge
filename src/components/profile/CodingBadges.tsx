import { useEffect, useRef, useState } from "react";
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
  glow?: boolean;
}

const BADGE_CONFIG: Record<string, { label: string; Icon: React.ElementType; url: string }> = {
  react: { label: "React", Icon: SiReact, url: "https://react.dev" },
  python: { label: "Python", Icon: SiPython, url: "https://python.org" },
  ruby: { label: "Ruby", Icon: SiRuby, url: "https://ruby-lang.org" },
  tailwind: { label: "Tailwind", Icon: SiTailwindcss, url: "https://tailwindcss.com" },
  typescript: { label: "TypeScript", Icon: SiTypescript, url: "https://typescriptlang.org" },
  nextjs: { label: "Next.js", Icon: SiNextdotjs, url: "https://nextjs.org" },
  javascript: { label: "JavaScript", Icon: SiJavascript, url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
  nodejs: { label: "Node.js", Icon: SiNodedotjs, url: "https://nodejs.org" },
  vue: { label: "Vue.js", Icon: SiVuedotjs, url: "https://vuejs.org" },
  angular: { label: "Angular", Icon: SiAngular, url: "https://angular.io" },
  svelte: { label: "Svelte", Icon: SiSvelte, url: "https://svelte.dev" },
  go: { label: "Go", Icon: SiGo, url: "https://go.dev" },
  rust: { label: "Rust", Icon: SiRust, url: "https://rust-lang.org" },
  cpp: { label: "C++", Icon: SiCplusplus, url: "https://isocpp.org" },
  php: { label: "PHP", Icon: SiPhp, url: "https://php.net" },
  swift: { label: "Swift", Icon: SiSwift, url: "https://swift.org" },
  kotlin: { label: "Kotlin", Icon: SiKotlin, url: "https://kotlinlang.org" },
  flutter: { label: "Flutter", Icon: SiFlutter, url: "https://flutter.dev" },
  json: { label: "JSON", Icon: VscJson, url: "https://json.org" },
};

const CodingBadges = ({ badges, glow }: CodingBadgesProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!badges || badges.length === 0) return null;

  return (
    <div 
      ref={sectionRef}
      className={`flex flex-wrap gap-2 justify-start transition-all duration-700 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-8 scale-75"
      }`}
    >
      {badges.map((badgeKey) => {
        const config = BADGE_CONFIG[badgeKey];
        if (!config) return null;
        const { label, Icon, url } = config;
        
        return (
          <a
            key={badgeKey}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-foreground/30 bg-background/20 backdrop-blur-sm hover:bg-foreground/10 transition-all ${
              glow ? "shadow-[0_0_10px_hsl(var(--primary)/0.5)]" : ""
            }`}
          >
            <Icon className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </a>
        );
      })}
    </div>
  );
};

export { BADGE_CONFIG };
export default CodingBadges;