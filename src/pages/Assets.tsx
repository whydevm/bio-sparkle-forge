import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Download, Trash2, User, Image, Music, MousePointer, ImageIcon, Check, Heart } from "lucide-react";

interface Asset {
  id: string;
  uploader_id: string;
  asset_type: string;
  file_url: string;
  file_name: string;
  downloads: number;
  created_at: string;
  uploader_username?: string;
  favorite_count?: number;
  is_favorited?: boolean;
}

type SortMode = "newest" | "downloads" | "favorites";

const Assets = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>("avatar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { checkUser(); }, []);
  useEffect(() => { if (profile) loadAssets(); }, [activeTab, sortMode, profile]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    setUserId(user.id);
    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (profileData) setProfile(profileData);
    setLoading(false);
  };

  const loadAssets = async () => {
    let query = supabase.from("assets").select("*");
    if (activeTab === "owned") query = query.eq("uploader_id", userId);
    else if (activeTab === "favorited" && userId) {
      const { data: favs } = await supabase.from("asset_favorites").select("asset_id").eq("user_id", userId);
      const ids = favs?.map(f => f.asset_id) || [];
      if (ids.length === 0) { setAssets([]); return; }
      query = query.in("id", ids);
    } else if (!["all", "owned", "favorited"].includes(activeTab)) {
      query = query.eq("asset_type", activeTab);
    }

    if (sortMode === "downloads") query = query.order("downloads", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data } = await query;
    if (!data) return;

    // Get usernames
    const uploaderIds = [...new Set(data.map(a => a.uploader_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username").in("user_id", uploaderIds);
    const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);

    // Get favorite counts
    const { data: favs } = await supabase.from("asset_favorites").select("asset_id").in("asset_id", data.map(a => a.id));
    const favCounts = new Map<string, number>();
    favs?.forEach(f => favCounts.set(f.asset_id, (favCounts.get(f.asset_id) || 0) + 1));

    // Get current user favorites
    let myFavs = new Set<string>();
    if (userId) {
      const { data: mine } = await supabase.from("asset_favorites").select("asset_id").eq("user_id", userId);
      myFavs = new Set(mine?.map(m => m.asset_id) || []);
    }

    let enriched = data.map(a => ({
      ...a,
      uploader_username: usernameMap.get(a.uploader_id) || "Unknown",
      favorite_count: favCounts.get(a.id) || 0,
      is_favorited: myFavs.has(a.id),
    }));

    if (sortMode === "favorites") enriched.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
    setAssets(enriched);
  };

  const toggleFavorite = async (asset: Asset) => {
    if (!userId) { toast.error("Sign in to favorite"); return; }
    if (asset.is_favorited) {
      await supabase.from("asset_favorites").delete().eq("asset_id", asset.id).eq("user_id", userId);
    } else {
      await supabase.from("asset_favorites").insert({ asset_id: asset.id, user_id: userId });
    }
    loadAssets();
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const bucket = uploadType === "audio" ? "music" : uploadType === "avatar" ? "avatars" : uploadType === "cursor" ? "cursors" : "backgrounds";
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, selectedFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      const { error: insertError } = await supabase.from("assets").insert({
        uploader_id: userId, asset_type: uploadType, file_url: urlData.publicUrl, file_name: selectedFile.name
      });
      if (insertError) throw insertError;
      toast.success("Asset uploaded!");
      setUploadOpen(false);
      setSelectedFile(null);
      loadAssets();
    } catch (error: any) { toast.error(error.message); }
    setUploading(false);
  };

  const handleDownload = async (asset: Asset) => {
    await supabase.from("assets").update({ downloads: asset.downloads + 1 }).eq("id", asset.id);
    try {
      const response = await fetch(asset.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = asset.file_name;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
      toast.success("Download started!");
    } catch { window.open(asset.file_url, "_blank"); }
    loadAssets();
  };

  const handleDelete = async (asset: Asset) => {
    try {
      const { error } = await supabase.from("assets").delete().eq("id", asset.id);
      if (error) throw error;
      toast.success("Asset deleted!");
      loadAssets();
    } catch (error: any) { toast.error(error.message); }
  };

  const handleApply = async (asset: Asset) => {
    try {
      let updateData: any = {};
      if (asset.asset_type === "avatar") updateData.avatar_url = asset.file_url;
      else if (asset.asset_type === "background") {
        updateData.background_url = asset.file_url;
        updateData.background_type = asset.file_url.endsWith(".mp4") ? "video" : "image";
      } else if (asset.asset_type === "banner") updateData.banner_url = asset.file_url;
      else if (asset.asset_type === "cursor") updateData.custom_cursor = asset.file_url;
      const { error } = await supabase.from("profiles").update(updateData).eq("id", profile.id);
      if (error) throw error;
      toast.success(`${asset.asset_type} applied!`);
    } catch (error: any) { toast.error(error.message); }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "avatar": return <User className="w-4 h-4" />;
      case "background": return <Image className="w-4 h-4" />;
      case "banner": return <ImageIcon className="w-4 h-4" />;
      case "cursor": return <MousePointer className="w-4 h-4" />;
      case "audio": return <Music className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <DashboardLayout username={profile?.username}>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-primary" />
                Assets
              </h1>
              <p className="text-muted-foreground text-sm">Share and discover assets</p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="downloads">Most downloaded</SelectItem>
                  <SelectItem value="favorites">Most favorited</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle>Upload Asset</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Type</Label>
                      <Select value={uploadType} onValueChange={setUploadType}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="avatar">Avatar</SelectItem>
                          <SelectItem value="background">Background</SelectItem>
                          <SelectItem value="banner">Banner</SelectItem>
                          <SelectItem value="cursor">Cursor</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">File</Label>
                      <Input
                        type="file"
                        accept={uploadType === "audio" ? "audio/mp3,audio/mpeg" : "image/*,video/*"}
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-8 h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="owned" className="text-xs">Mine</TabsTrigger>
              <TabsTrigger value="favorited" className="text-xs">Favs</TabsTrigger>
              <TabsTrigger value="avatar" className="text-xs">Avatars</TabsTrigger>
              <TabsTrigger value="background" className="text-xs">BGs</TabsTrigger>
              <TabsTrigger value="banner" className="text-xs">Banners</TabsTrigger>
              <TabsTrigger value="cursor" className="text-xs">Cursors</TabsTrigger>
              <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      {asset.asset_type === "audio" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-10 h-10 text-muted-foreground" />
                        </div>
                      ) : (
                        <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        {getTypeIcon(asset.asset_type)}
                      </div>
                      <button
                        onClick={() => toggleFavorite(asset)}
                        className="absolute top-1.5 left-1.5 bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-background transition"
                        title={asset.is_favorited ? "Unfavorite" : "Favorite"}
                      >
                        <Heart className={`w-3 h-3 ${asset.is_favorited ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{asset.favorite_count || 0}</span>
                      </button>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate">{asset.uploader_username}</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Download className="w-3 h-3" />{asset.downloads}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(asset)} className="flex-1 h-7 text-xs">
                          <Download className="w-3 h-3" />
                        </Button>
                        {asset.asset_type !== "audio" && (
                          <Button size="sm" variant="outline" onClick={() => handleApply(asset)} className="flex-1 h-7 text-xs text-green-500">
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        {asset.uploader_id === userId && (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(asset)} className="h-7">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                    No assets found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Assets;
