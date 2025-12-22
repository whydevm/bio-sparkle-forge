import { useState, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  tags: string[];
}

interface ProjectsSectionProps {
  projects: Project[];
  title?: string;
  description?: string;
}

const ProjectsSection = ({ projects, title = "Projects", description }: ProjectsSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);
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

  if (!projects || projects.length === 0) return null;

  const handleProjectClick = (url: string) => {
    if (url) {
      setConfirmUrl(url);
    }
  };

  const handleConfirmLeave = () => {
    if (confirmUrl) {
      window.open(confirmUrl, "_blank");
      setConfirmUrl(null);
    }
  };

  return (
    <>
      <div
        ref={sectionRef}
        className={`w-full px-8 pb-8 transition-all duration-700 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-xl font-bold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        )}

        <div className="grid gap-4 max-w-2xl">
          {projects.map((project, index) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.url)}
              className={`relative rounded-2xl overflow-hidden border border-foreground/20 bg-background/20 backdrop-blur-sm cursor-pointer hover:border-foreground/40 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {project.image_url ? (
                <div className="relative h-48">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  {project.tags && project.tags.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm text-sm text-foreground">
                        {project.tags[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <h4 className="text-lg font-bold text-white">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-white/80">{project.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{project.title}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      )}
                    </div>
                    {project.url && (
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted text-xs text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!confirmUrl} onOpenChange={() => setConfirmUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave this site?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to leave this website and visit an external link. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLeave}>
              Yes, continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectsSection;