import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, Copy, ExternalLink, Link2, Code, Image } from "lucide-react";

interface ProfileShareBannerProps {
  open: boolean;
  onClose: () => void;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

const ProfileShareBanner = ({
  open,
  onClose,
  username,
  displayName,
  avatarUrl,
  bio
}: ProfileShareBannerProps) => {
  const [activeTab, setActiveTab] = useState<"link" | "embed" | "banner">("link");
  
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/${username}`;
  
  const embedCode = `<iframe src="${profileUrl}" width="400" height="600" frameborder="0"></iframe>`;
  
  const bannerHtml = `<a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
  <img src="${avatarUrl || `${baseUrl}/placeholder.svg`}" alt="${displayName || username}" style="width: 50px; height: 50px; border-radius: 50%; display: inline-block; vertical-align: middle;" />
  <span style="margin-left: 10px; font-weight: bold;">${displayName || username}</span>
</a>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Share2 className="w-5 h-5" />
            Share Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview Card */}
          <div className="border border-border rounded-xl p-4 bg-card/50">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || username} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold">{(displayName || username)?.[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{displayName || username}</p>
                <p className="text-sm text-muted-foreground truncate">{bio || `@${username}`}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab("link")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === "link" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link2 className="w-4 h-4" />
              Link
            </button>
            <button
              onClick={() => setActiveTab("embed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === "embed" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Code className="w-4 h-4" />
              Embed
            </button>
            <button
              onClick={() => setActiveTab("banner")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeTab === "banner" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Image className="w-4 h-4" />
              Banner
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "link" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Share your profile link with others</p>
              <div className="flex gap-2">
                <Input
                  value={profileUrl}
                  readOnly
                  className="bg-card/50 border-border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(profileUrl, "Profile link")}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(profileUrl, "_blank")}
                  className="border-border"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === "embed" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Embed your profile on your website</p>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className="w-full h-24 p-3 bg-card/50 border border-border rounded-lg text-xs font-mono resize-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(embedCode, "Embed code")}
                  className="absolute top-2 right-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {activeTab === "banner" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Add a profile banner to your website or forum signature</p>
              <div className="relative">
                <textarea
                  value={bannerHtml}
                  readOnly
                  className="w-full h-32 p-3 bg-card/50 border border-border rounded-lg text-xs font-mono resize-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bannerHtml, "Banner HTML")}
                  className="absolute top-2 right-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="font-bold">{(displayName || username)?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <span className="font-semibold">{displayName || username}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileShareBanner;