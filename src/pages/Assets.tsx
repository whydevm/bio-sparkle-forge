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
import { Upload, Download, Trash2, User, Image, Music, MousePointer, ImageIcon, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Asset {
  id: string;
  uploader_id: string;
  asset_type: string;
  file_url: string;
  file_name: string;
  downloads: number;
  created_at: string;
  uploader_username?: string;
}

const Assets = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<string>("avatar");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (profile) {
      loadAssets();
    }
  }, [activeTab, profile]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
    setLoading(false);
  };

  const loadAssets = async () => {
    let query = supabase.from("assets").select("*").order("created_at", { ascending: false });
    
    if (activeTab === "owned") {
      query = query.eq("uploader_id", userId);
    } else if (activeTab !== "all") {
      query = query.eq("asset_type", activeTab);
    }

    const { data } = await query;
    
    if (data) {
      // Get uploader usernames
      const uploaderIds = [...new Set(data.map(a => a.uploader_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", uploaderIds);
      
      const usernameMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
      
      setAssets(data.map(a => ({
        ...a,
        uploader_username: usernameMap.get(a.uploader_id) || "Unknown"
      })));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const bucket = uploadType === "audio" ? "music" : uploadType === "avatar" ? "avatars" : uploadType === "background" ? "backgrounds" : uploadType === "cursor" ? "cursors" : "backgrounds";

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("assets").insert({
        uploader_id: userId,
        asset_type: uploadType,
        file_url: urlData.publicUrl,
        file_name: selectedFile.name
      });

      if (insertError) throw insertError;

      toast.success("Asset uploaded!");
      setUploadOpen(false);
      setSelectedFile(null);
      loadAssets();
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const handleDownload = async (asset: Asset) => {
    // Increment download count
    await supabase.from("assets").update({ downloads: asset.downloads + 1 }).eq("id", asset.id);
    
    // Download file
    window.open(asset.file_url, "_blank");
    loadAssets();
  };

  const handleDelete = async (asset: Asset) => {
    try {
      const { error } = await supabase.from("assets").delete().eq("id", asset.id);
      if (error) throw error;
      toast.success("Asset deleted!");
      loadAssets();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleApply = async (asset: Asset) => {
    try {
      let updateData: any = {};
      
      if (asset.asset_type === "avatar") {
        updateData.avatar_url = asset.file_url;
      } else if (asset.asset_type === "background") {
        updateData.background_url = asset.file_url;
        updateData.background_type = asset.file_url.endsWith(".mp4") ? "video" : "image";
      } else if (asset.asset_type === "banner") {
        updateData.banner_url = asset.file_url;
      } else if (asset.asset_type === "cursor") {
        updateData.custom_cursor = asset.file_url;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);

      if (error) throw error;
      toast.success(`${asset.asset_type} applied!`);
    } catch (error: any) {
      toast.error(error.message);
    }
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout username={profile?.username}>
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Assets
              </h1>
              <p className="text-muted-foreground">Share and discover useful assets for your profile</p>
            </div>
            
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Asset Type</Label>
                    <Select value={uploadType} onValueChange={setUploadType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
                    <Label>File</Label>
                    <Input
                      type="file"
                      accept={uploadType === "audio" ? "audio/*" : "image/*,video/*"}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full">
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="owned">Owned</TabsTrigger>
              <TabsTrigger value="avatar">Avatars</TabsTrigger>
              <TabsTrigger value="background">Backgrounds</TabsTrigger>
              <TabsTrigger value="banner">Banners</TabsTrigger>
              <TabsTrigger value="cursor">Cursors</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      {asset.asset_type === "audio" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-12 h-12 text-muted-foreground" />
                        </div>
                      ) : (
                        <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {getTypeIcon(asset.asset_type)}
                        <span className="capitalize">{asset.asset_type}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{asset.uploader_username}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {asset.downloads} Downloads
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(asset)} className="flex-1">
                          <Download className="w-4 h-4" />
                        </Button>
                        {asset.asset_type !== "audio" && (
                          <Button size="sm" variant="outline" onClick={() => handleApply(asset)} className="flex-1 text-green-500 hover:text-green-400">
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {asset.uploader_id === userId && (
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(asset)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
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