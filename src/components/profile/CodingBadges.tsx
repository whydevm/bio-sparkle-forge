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
  SiFlutter,
  SiHtml5,
  SiCss3,
  SiBootstrap,
  SiWebpack,
  SiVite,
  SiRedux,
  SiAstro,
  SiStorybook,
  SiExpress,
  SiFastapi,
  SiGraphql,
  SiFlask,
  SiDjango,
  SiSpringboot,
  SiDotnet,
  SiRubyonrails,
  SiNestjs,
  SiAdonisjs,
  SiLaravel,
  SiGit,
  SiLua,
  SiC,
  SiHaskell,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiMariadb,
  SiSqlite,
  SiRedis,
  SiElasticsearch,
  SiSupabase,
  SiAmazonwebservices,
  SiGooglecloud,
  SiCloudflare,
  SiVercel,
  SiNetlify,
  SiDocker,
  SiKubernetes,
  SiPostman,
  SiInsomnia,
  SiFigma,
  SiAdobeillustrator,
  SiAdobephotoshop,
  SiCanva,
  SiBlender,
  SiUnity,
  SiUnrealengine,
  SiGodotengine,
  SiRobloxstudio
} from "react-icons/si";
import { VscJson, VscAzure, VscCode } from "react-icons/vsc";
import { Code, Smartphone, Palette, Gamepad2 } from "lucide-react";

interface CodingBadgesProps {
  badges: string[];
  glow?: boolean;
}

// Organized by category as shown in reference
const BADGE_CONFIG: Record<string, { label: string; Icon: React.ElementType; url: string; category: string }> = {
  // Frontend
  html5: { label: "HTML 5", Icon: SiHtml5, url: "https://html.spec.whatwg.org", category: "Frontend" },
  react: { label: "React", Icon: SiReact, url: "https://react.dev", category: "Frontend" },
  nextjs: { label: "Next.js", Icon: SiNextdotjs, url: "https://nextjs.org", category: "Frontend" },
  vue: { label: "Vue.js", Icon: SiVuedotjs, url: "https://vuejs.org", category: "Frontend" },
  css3: { label: "CSS 3", Icon: SiCss3, url: "https://www.w3.org/Style/CSS", category: "Frontend" },
  tailwind: { label: "Tailwind", Icon: SiTailwindcss, url: "https://tailwindcss.com", category: "Frontend" },
  bootstrap: { label: "Bootstrap", Icon: SiBootstrap, url: "https://getbootstrap.com", category: "Frontend" },
  webpack: { label: "Webpack", Icon: SiWebpack, url: "https://webpack.js.org", category: "Frontend" },
  svelte: { label: "Svelte", Icon: SiSvelte, url: "https://svelte.dev", category: "Frontend" },
  vite: { label: "Vite", Icon: SiVite, url: "https://vitejs.dev", category: "Frontend" },
  shadcn: { label: "Shadcn/UI", Icon: Code, url: "https://ui.shadcn.com", category: "Frontend" },
  angular: { label: "Angular", Icon: SiAngular, url: "https://angular.io", category: "Frontend" },
  astro: { label: "Astro", Icon: SiAstro, url: "https://astro.build", category: "Frontend" },
  redux: { label: "Redux", Icon: SiRedux, url: "https://redux.js.org", category: "Frontend" },
  storybook: { label: "Storybook", Icon: SiStorybook, url: "https://storybook.js.org", category: "Frontend" },

  // Backend
  nodejs: { label: "Node.js", Icon: SiNodedotjs, url: "https://nodejs.org", category: "Backend" },
  express: { label: "Express", Icon: SiExpress, url: "https://expressjs.com", category: "Backend" },
  fastapi: { label: "FastAPI", Icon: SiFastapi, url: "https://fastapi.tiangolo.com", category: "Backend" },
  graphql: { label: "GraphQL", Icon: SiGraphql, url: "https://graphql.org", category: "Backend" },
  flask: { label: "Flask", Icon: SiFlask, url: "https://flask.palletsprojects.com", category: "Backend" },
  django: { label: "Django", Icon: SiDjango, url: "https://www.djangoproject.com", category: "Backend" },
  springboot: { label: "Spring Boot", Icon: SiSpringboot, url: "https://spring.io/projects/spring-boot", category: "Backend" },
  dotnet: { label: ".NET", Icon: SiDotnet, url: "https://dotnet.microsoft.com", category: "Backend" },
  rails: { label: "Ruby on Rails", Icon: SiRubyonrails, url: "https://rubyonrails.org", category: "Backend" },
  nestjs: { label: "NestJS", Icon: SiNestjs, url: "https://nestjs.com", category: "Backend" },
  laravel: { label: "Laravel", Icon: SiLaravel, url: "https://laravel.com", category: "Backend" },
  adonisjs: { label: "AdonisJS", Icon: SiAdonisjs, url: "https://adonisjs.com", category: "Backend" },
  hono: { label: "Hono", Icon: Code, url: "https://hono.dev", category: "Backend" },

  // Core Languages
  git: { label: "Git", Icon: SiGit, url: "https://git-scm.com", category: "Core" },
  go: { label: "Go", Icon: SiGo, url: "https://go.dev", category: "Core" },
  java: { label: "Java", Icon: Code, url: "https://www.java.com", category: "Core" },
  javascript: { label: "JavaScript", Icon: SiJavascript, url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", category: "Core" },
  lua: { label: "Lua", Icon: SiLua, url: "https://www.lua.org", category: "Core" },
  php: { label: "PHP", Icon: SiPhp, url: "https://php.net", category: "Core" },
  python: { label: "Python", Icon: SiPython, url: "https://python.org", category: "Core" },
  ruby: { label: "Ruby", Icon: SiRuby, url: "https://ruby-lang.org", category: "Core" },
  rust: { label: "Rust", Icon: SiRust, url: "https://rust-lang.org", category: "Core" },
  swift: { label: "Swift", Icon: SiSwift, url: "https://swift.org", category: "Core" },
  typescript: { label: "TypeScript", Icon: SiTypescript, url: "https://typescriptlang.org", category: "Core" },
  c: { label: "C", Icon: SiC, url: "https://en.cppreference.com/w/c", category: "Core" },
  cpp: { label: "C++", Icon: SiCplusplus, url: "https://isocpp.org", category: "Core" },
  kotlin: { label: "Kotlin", Icon: SiKotlin, url: "https://kotlinlang.org", category: "Core" },
  fsharp: { label: "F#", Icon: Code, url: "https://fsharp.org", category: "Core" },
  haskell: { label: "Haskell", Icon: SiHaskell, url: "https://www.haskell.org", category: "Core" },
  json: { label: "JSON", Icon: VscJson, url: "https://json.org", category: "Core" },

  // Database
  mongodb: { label: "MongoDB", Icon: SiMongodb, url: "https://mongodb.com", category: "Database" },
  mysql: { label: "MySQL", Icon: SiMysql, url: "https://mysql.com", category: "Database" },
  postgresql: { label: "PostgreSQL", Icon: SiPostgresql, url: "https://postgresql.org", category: "Database" },
  mariadb: { label: "MariaDB", Icon: SiMariadb, url: "https://mariadb.org", category: "Database" },
  sqlite: { label: "SQLite", Icon: SiSqlite, url: "https://sqlite.org", category: "Database" },
  redis: { label: "Redis", Icon: SiRedis, url: "https://redis.io", category: "Database" },
  elasticsearch: { label: "Elasticsearch", Icon: SiElasticsearch, url: "https://elastic.co", category: "Database" },
  supabase: { label: "Supabase", Icon: SiSupabase, url: "https://supabase.com", category: "Database" },

  // Cloud
  aws: { label: "AWS", Icon: SiAmazonwebservices, url: "https://aws.amazon.com", category: "Cloud" },
  azure: { label: "Azure", Icon: VscAzure, url: "https://azure.microsoft.com", category: "Cloud" },
  gcloud: { label: "Google Cloud", Icon: SiGooglecloud, url: "https://cloud.google.com", category: "Cloud" },
  cloudflare: { label: "Cloudflare", Icon: SiCloudflare, url: "https://cloudflare.com", category: "Cloud" },
  vercel: { label: "Vercel", Icon: SiVercel, url: "https://vercel.com", category: "Cloud" },
  netlify: { label: "Netlify", Icon: SiNetlify, url: "https://netlify.com", category: "Cloud" },
  docker: { label: "Docker", Icon: SiDocker, url: "https://docker.com", category: "Cloud" },
  kubernetes: { label: "Kubernetes", Icon: SiKubernetes, url: "https://kubernetes.io", category: "Cloud" },

  // Tools
  vscode: { label: "VS Code", Icon: VscCode, url: "https://code.visualstudio.com", category: "Tools" },
  visualstudio: { label: "Visual Studio", Icon: Code, url: "https://visualstudio.microsoft.com", category: "Tools" },
  jetbrains: { label: "JetBrains", Icon: Code, url: "https://jetbrains.com", category: "Tools" },
  cmake: { label: "CMake", Icon: Code, url: "https://cmake.org", category: "Tools" },
  postman: { label: "Postman", Icon: SiPostman, url: "https://postman.com", category: "Tools" },
  insomnia: { label: "Insomnia", Icon: SiInsomnia, url: "https://insomnia.rest", category: "Tools" },

  // Mobile
  reactnative: { label: "React Native", Icon: SiReact, url: "https://reactnative.dev", category: "Mobile" },
  flutter: { label: "Flutter", Icon: SiFlutter, url: "https://flutter.dev", category: "Mobile" },
  swiftui: { label: "SwiftUI", Icon: SiSwift, url: "https://developer.apple.com/xcode/swiftui", category: "Mobile" },
  androidstudio: { label: "Android Studio", Icon: Smartphone, url: "https://developer.android.com/studio", category: "Mobile" },
  xcode: { label: "Xcode", Icon: Code, url: "https://developer.apple.com/xcode", category: "Mobile" },

  // Design
  figma: { label: "Figma", Icon: SiFigma, url: "https://figma.com", category: "Design" },
  illustrator: { label: "Illustrator", Icon: SiAdobeillustrator, url: "https://adobe.com/products/illustrator", category: "Design" },
  photoshop: { label: "Photoshop", Icon: SiAdobephotoshop, url: "https://adobe.com/products/photoshop", category: "Design" },
  canva: { label: "Canva", Icon: SiCanva, url: "https://canva.com", category: "Design" },
  blender: { label: "Blender", Icon: SiBlender, url: "https://blender.org", category: "Design" },

  // Game
  unity: { label: "Unity", Icon: SiUnity, url: "https://unity.com", category: "Game" },
  unreal: { label: "Unreal Engine", Icon: SiUnrealengine, url: "https://unrealengine.com", category: "Game" },
  godot: { label: "Godot", Icon: SiGodotengine, url: "https://godotengine.org", category: "Game" },
  robloxstudio: { label: "Roblox Studio", Icon: SiRobloxstudio, url: "https://create.roblox.com", category: "Game" },
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