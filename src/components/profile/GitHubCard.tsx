import { useEffect, useState } from "react";
import { FaGithub, FaUsers, FaCodeBranch, FaStar, FaExternalLinkAlt } from "react-icons/fa";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GitHubCardProps {
  username: string;
  globalRadius?: number;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  followers: number;
  public_repos: number;
  html_url: string;
  bio: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Ruby: "#701516",
  PHP: "#4F5D95",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
};

const GitHubCard = ({ username, globalRadius = 50 }: GitHubCardProps) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reposLoaded, setReposLoaded] = useState(false);

  const borderRadius = `${Math.round((globalRadius / 100) * 24)}px`;

  useEffect(() => {
    if (!username) return;
    fetch(`https://api.github.com/users/${username}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [username]);

  const loadRepos = async () => {
    if (reposLoaded) return;
    try {
      const r = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      if (r.ok) setRepos(await r.json());
    } catch {}
    setReposLoaded(true);
  };

  const openModal = () => {
    setModalOpen(true);
    loadRepos();
  };

  if (loading) {
    return (
      <div
        className="font-ggsans flex items-center gap-3 p-4 border border-white/10 backdrop-blur-sm animate-pulse"
        style={{ borderRadius }}
      >
        <div className="w-14 h-14 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="w-24 h-4 bg-white/10 rounded" />
          <div className="w-32 h-3 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="font-ggsans flex items-center gap-3 p-4 border border-white/10 backdrop-blur-sm"
        style={{ borderRadius }}
      >
        <FaGithub className="w-6 h-6 text-white/60" />
        <span className="text-sm text-white/60">@{username} not found</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={openModal}
        className="font-ggsans w-full flex items-center gap-3 p-4 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all text-left cursor-pointer"
        style={{ borderRadius }}
      >
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-14 h-14 object-cover flex-shrink-0"
          style={{ borderRadius: `${Math.round((globalRadius / 100) * 16)}px` }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{user.name || user.login}</div>
          <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
            <span className="flex items-center gap-1">
              <FaUsers className="w-3 h-3" /> {user.followers} Followers
            </span>
            <span className="flex items-center gap-1">
              <FaCodeBranch className="w-3 h-3" /> {user.public_repos} Repos
            </span>
          </div>
        </div>
        <div className="text-xs text-white/60 flex items-center gap-1 flex-shrink-0">
          <FaGithub className="w-4 h-4" />
          GitHub
        </div>
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="max-w-2xl bg-black/90 border-white/10 backdrop-blur-xl text-white font-ggsans p-0"
          style={{ borderRadius }}
        >
          <div className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <FaGithub className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">GitHub Repositories - {user.login}</h2>
                <p className="text-sm text-white/60">Here you can see the latest repositories from this user.</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {!reposLoaded ? (
                <div className="text-center py-8 text-white/50">Loading repos...</div>
              ) : repos.length === 0 ? (
                <div className="text-center py-8 text-white/50">No public repositories</div>
              ) : (
                repos.map(repo => (
                  <div
                    key={repo.id}
                    className="p-4 border border-white/10 hover:border-white/20 transition-all"
                    style={{ borderRadius }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">{repo.name}</div>
                        {repo.description && (
                          <p className="text-sm text-white/60 mt-1">{repo.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                          {repo.language && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: LANG_COLORS[repo.language] || "#888" }}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/60 flex-shrink-0">
                        <span className="flex items-center gap-1">
                          <FaStar className="w-3 h-3" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCodeBranch className="w-3 h-3" /> {repo.forks_count}
                        </span>
                      </div>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" /> View Repository
                    </a>
                  </div>
                ))
              )}
            </div>

            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-white/70 hover:text-white"
            >
              <FaExternalLinkAlt className="w-3 h-3" /> View Profile on GitHub
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GitHubCard;
