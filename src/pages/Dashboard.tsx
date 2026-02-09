import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AvatarManager from "@/components/dashboard/AvatarManager";
import BackgroundManager from "@/components/dashboard/BackgroundManager";
import AudioManager from "@/components/dashboard/AudioManager";
import CursorManager from "@/components/dashboard/CursorManager";
import ProjectsEditor from "@/components/dashboard/ProjectsEditor";
import ThemeSelector from "@/components/dashboard/ThemeSelector";
import SaveChangesBar from "@/components/dashboard/SaveChangesBar";
import SocialCardsEditor from "@/components/dashboard/SocialCardsEditor";
import JoinDateEditor from "@/components/dashboard/JoinDateEditor";
import ClickSoundManager from "@/components/dashboard/ClickSoundManager";
import EffectsPreview from "@/components/dashboard/EffectsPreview";
import BorderEffectSelector from "@/components/dashboard/BorderEffectSelector";
import { User, Image, Music, MousePointer, Settings, Palette, Square, RotateCcw, Code2, FolderKanban, Sparkles, Share2, Calendar } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import CodingBadgesEditor from "@/components/dashboard/CodingBadgesEditor";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [originalProfile, setOriginalProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Manager modal states
  const [showAvatarManager, setShowAvatarManager] = useState(false);
  const [showBackgroundManager, setShowBackgroundManager] = useState(false);
  const [showAudioManager, setShowAudioManager] = useState(false);
  const [showCursorManager, setShowCursorManager] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setOriginalProfile(data);
      loadProjects(data.id);
    }
    setLoading(false);
  };

  const loadProjects = async (profileId: string) => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("profile_id", profileId)
      .order("order_index");
    setProjects(data || []);
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(originalProfile);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);

      if (error) throw error;
      setOriginalProfile(profile);
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleReset = () => {
    setProfile(originalProfile);
  };

  const updateProfile = (updates: Partial<typeof profile>) => {
    setProfile({ ...profile, ...updates });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout username={profile?.username} displayName={profile?.display_name} avatarUrl={profile?.avatar_url} bio={profile?.bio}>
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Main Manager Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Avatar Card */}
            <div
              onClick={() => setShowAvatarManager(true)}
              className="border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-card/30 aspect-square"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-xs text-center">Avatar</span>
            </div>

            {/* Background Card */}
            <div
              onClick={() => setShowBackgroundManager(true)}
              className="border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-card/30 aspect-square"
            >
              {profile?.background_url ? (
                profile?.background_type === "video" ? (
                  <video src={profile.background_url} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <img src={profile.background_url} alt="Background" className="w-12 h-12 object-cover rounded" />
                )
              ) : (
                <Image className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-xs text-center">Background</span>
            </div>

            {/* Audio Card */}
            <div
              onClick={() => setShowAudioManager(true)}
              className="border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-card/30 aspect-square"
            >
              <Music className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground text-xs text-center">Audio</span>
            </div>

            {/* Cursor Card */}
            <div
              onClick={() => setShowCursorManager(true)}
              className="border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors bg-card/30 aspect-square"
            >
              {profile?.custom_cursor ? (
                <img src={profile.custom_cursor} alt="Cursor" className="w-8 h-8 object-contain" />
              ) : (
                <MousePointer className="w-8 h-8 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-xs text-center">Cursor</span>
            </div>
          </div>

          {/* Click Sound - Now at top */}
          <ClickSoundManager
            enabled={profile?.click_sounds ?? false}
            soundUrl={profile?.click_sound_url}
            onSettingsChange={(settings) => updateProfile(settings)}
          />

          {/* General Customization Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General
            </h2>
            
            <div className="border border-border rounded-xl p-4 md:p-6 space-y-5 bg-card/30">
              {/* Cycling Bio Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Cycling Bio</Label>
                <Switch
                  checked={profile?.cycling_bio_enabled ?? false}
                  onCheckedChange={(checked) => updateProfile({ cycling_bio_enabled: checked })}
                />
              </div>

              {/* Description / Bio Texts */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">{profile?.cycling_bio_enabled ? "Bio Texts" : "Description"}</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.bio || "").length}/200</span>
                </div>
                {profile?.cycling_bio_enabled ? (
                  <Textarea
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile({ bio: e.target.value.slice(0, 200) })}
                    placeholder="Enter multiple bio texts (one per line)"
                    className="bg-card/50 border-border min-h-[80px] text-sm"
                  />
                ) : (
                  <Input
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile({ bio: e.target.value.slice(0, 200) })}
                    placeholder="Enter your description"
                    className="bg-card/50 border-border text-sm"
                  />
                )}
              </div>

              {/* Avatar Radius */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Avatar Radius</Label>
                  <span className="text-xs bg-card px-2 py-0.5 rounded">{profile?.avatar_radius ?? 100}%</span>
                </div>
                <Slider
                  value={[profile?.avatar_radius ?? 100]}
                  onValueChange={([value]) => updateProfile({ avatar_radius: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>

              {/* Profile Opacity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Profile Opacity</Label>
                  <span className="text-xs bg-card px-2 py-0.5 rounded">{profile?.profile_opacity ?? 100}%</span>
                </div>
                <Slider
                  value={[profile?.profile_opacity ?? 100]}
                  onValueChange={([value]) => updateProfile({ profile_opacity: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>

              {/* Global Radius */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Global Radius</Label>
                  <span className="text-xs bg-card px-2 py-0.5 rounded">{profile?.global_radius ?? 50}%</span>
                </div>
                <Slider
                  value={[profile?.global_radius ?? 50]}
                  onValueChange={([value]) => updateProfile({ global_radius: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls roundness of badges, social cards, profile border, and coding badges
                </p>
              </div>

              {/* Profile Blur */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Profile Blur</Label>
                  <span className="text-xs bg-card px-2 py-0.5 rounded">{profile?.profile_blur || 0}px</span>
                </div>
                <Slider
                  value={[profile?.profile_blur || 0]}
                  onValueChange={([value]) => updateProfile({ profile_blur: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>

              {/* Background Effects */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Background Effects</Label>
                  <EffectsPreview effect={profile?.background_effect || "none"} />
                </div>
                <Select
                  value={profile?.background_effect || "none"}
                  onValueChange={(value) => updateProfile({ background_effect: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border text-sm">
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="particles">Particles</SelectItem>
                    <SelectItem value="snow">Snow</SelectItem>
                    <SelectItem value="rain">Rain</SelectItem>
                    <SelectItem value="oldtv">Old TV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entry Animation */}
              <div>
                <Label className="text-sm mb-1.5 block">Entry Animation</Label>
                <Select
                  value={profile?.entry_animation || "none"}
                  onValueChange={(value) => updateProfile({ entry_animation: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border text-sm">
                    <SelectValue placeholder="Select animation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Fade)</SelectItem>
                    <SelectItem value="horizontal">Horizontal Split</SelectItem>
                    <SelectItem value="vertical">Vertical Split</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show Entry Background Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show Background on Entry Screen</Label>
                <Switch
                  checked={profile?.show_entry_background ?? true}
                  onCheckedChange={(checked) => updateProfile({ show_entry_background: checked })}
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <h3 className="text-sm font-semibold text-primary">Entry Screen Emoji</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Discord Emoji ID</Label>
                    <Input
                      value={profile?.entry_emoji || ""}
                      onChange={(e) => updateProfile({ entry_emoji: e.target.value })}
                      placeholder="e.g., <a:name:123456789>"
                      className="bg-card/50 border-border text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Emoji Position</Label>
                    <Select
                      value={profile?.entry_emoji_position || "start"}
                      onValueChange={(value) => updateProfile({ entry_emoji_position: value })}
                    >
                      <SelectTrigger className="bg-card/50 border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">Before Text</SelectItem>
                        <SelectItem value="end">After Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Scroll Text - Portfolio Theme Only */}
              {profile?.theme === "portfolio" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-sm">Scroll Down Text</Label>
                    <span className="text-xs text-muted-foreground">{(profile?.scroll_text || "").length}/50</span>
                  </div>
                  <Input
                    value={profile?.scroll_text || "Scroll for more"}
                    onChange={(e) => updateProfile({ scroll_text: e.target.value.slice(0, 50) })}
                    placeholder="Scroll for more"
                    className="bg-card/50 border-border text-sm"
                  />
                </div>
              )}

              {/* Toggle options */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Views</Label>
                  <Switch
                    checked={profile?.show_views ?? true}
                    onCheckedChange={(checked) => updateProfile({ show_views: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Views Animation</Label>
                  <Switch
                    checked={profile?.views_animation ?? true}
                    onCheckedChange={(checked) => updateProfile({ views_animation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show Join Date</Label>
                  <Switch
                    checked={profile?.show_join_date ?? true}
                    onCheckedChange={(checked) => updateProfile({ show_join_date: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Glow Username</Label>
                  <Switch
                    checked={profile?.glow_username}
                    onCheckedChange={(checked) => updateProfile({ glow_username: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Glow Socials</Label>
                  <Switch
                    checked={profile?.glow_socials}
                    onCheckedChange={(checked) => updateProfile({ glow_socials: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Monochrome Icons</Label>
                  <Switch
                    checked={profile?.monochrome_icons}
                    onCheckedChange={(checked) => updateProfile({ monochrome_icons: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Glow Badges</Label>
                  <Switch
                    checked={profile?.glow_badges}
                    onCheckedChange={(checked) => updateProfile({ glow_badges: checked })}
                  />
                </div>
              </div>

              {/* Join Date Customization */}
              {profile?.show_join_date && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Join Date Format
                  </h3>
                  <JoinDateEditor
                    createdAt={profile?.created_at || new Date().toISOString()}
                    dateFormat={profile?.join_date_format || "MMM dd, yyyy"}
                    timeFormat={profile?.join_time_format || "12h"}
                    timezone={profile?.join_timezone || "UTC"}
                    onSettingsChange={(settings) => updateProfile(settings)}
                  />
                </div>
              )}

              {/* Parallax Settings - Basic Theme Only */}
              {(profile?.theme === "basic" || profile?.theme === "default") && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <h3 className="text-sm font-semibold text-primary">Parallax Effect</h3>
                  <p className="text-xs text-muted-foreground">
                    Adds a 3D tilt effect when hovering over your profile card
                  </p>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Enable Parallax</Label>
                    <Switch
                      checked={profile?.parallax_enabled ?? false}
                      onCheckedChange={(checked) => updateProfile({ parallax_enabled: checked })}
                    />
                  </div>
                  {profile?.parallax_enabled && (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-sm">Parallax Intensity</Label>
                          <span className="text-xs bg-card px-2 py-0.5 rounded">{profile?.parallax_intensity ?? 50}%</span>
                        </div>
                        <Slider
                          value={[profile?.parallax_intensity ?? 50]}
                          onValueChange={([value]) => updateProfile({ parallax_intensity: value })}
                          max={100}
                          min={10}
                          step={5}
                          className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Invert Parallax</Label>
                        <Switch
                          checked={profile?.parallax_inverted ?? false}
                          onCheckedChange={(checked) => updateProfile({ parallax_inverted: checked })}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Username Effects */}
              <div className="pt-3 border-t border-border">
                <Label className="text-sm mb-1.5 block">Username Effects</Label>
                <Select
                  value={profile?.username_effect || "none"}
                  onValueChange={(value) => updateProfile({ username_effect: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border text-sm">
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="rainbow">Rainbow</SelectItem>
                    <SelectItem value="sparkles">Sparkles</SelectItem>
                    <SelectItem value="typewriter">Typewriter</SelectItem>
                    <SelectItem value="particles">Particles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Location</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.location || "").length}/32</span>
                </div>
                <Input
                  value={profile?.location || ""}
                  onChange={(e) => updateProfile({ location: e.target.value.slice(0, 32) })}
                  placeholder="Enter your location"
                  className="bg-card/50 border-border text-sm"
                />
              </div>


              {/* Entry Text */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">Entry Text</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.entry_text || "").length}/100</span>
                </div>
                <Input
                  value={profile?.entry_text || ""}
                  onChange={(e) => updateProfile({ entry_text: e.target.value.slice(0, 100) })}
                  placeholder="Click to Enter"
                  className="bg-card/50 border-border text-sm"
                />
              </div>

              {/* Font selectors in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                {/* Display Name Font */}
                <div>
                  <Label className="text-sm mb-1.5 block">Display Name Font</Label>
                  <Select
                    value={profile?.display_name_font || "font-ggsans"}
                    onValueChange={(value) => updateProfile({ display_name_font: value })}
                  >
                    <SelectTrigger className="bg-card/50 border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectItem value="font-ggsans">gg sans (default)</SelectItem>
                      <SelectItem value="font-sans">Inter</SelectItem>
                      <SelectItem value="font-roboto">Roboto</SelectItem>
                      <SelectItem value="font-poppins">Poppins</SelectItem>
                      <SelectItem value="font-montserrat">Montserrat</SelectItem>
                      <SelectItem value="font-mono">JetBrains Mono</SelectItem>
                      <SelectItem value="font-playfair">Playfair Display</SelectItem>
                      <SelectItem value="font-bebasneue">Bebas Neue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bio Font */}
                <div>
                  <Label className="text-sm mb-1.5 block">Bio Font</Label>
                  <Select
                    value={profile?.bio_font || "font-ggsans"}
                    onValueChange={(value) => updateProfile({ bio_font: value })}
                  >
                    <SelectTrigger className="bg-card/50 border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectItem value="font-ggsans">gg sans (default)</SelectItem>
                      <SelectItem value="font-sans">Inter</SelectItem>
                      <SelectItem value="font-roboto">Roboto</SelectItem>
                      <SelectItem value="font-poppins">Poppins</SelectItem>
                      <SelectItem value="font-mono">JetBrains Mono</SelectItem>
                      <SelectItem value="font-playfair">Playfair Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* About Me */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm">About Me</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.about_me || "").length}/500</span>
                </div>
                <Textarea
                  value={profile?.about_me || ""}
                  onChange={(e) => updateProfile({ about_me: e.target.value.slice(0, 500) })}
                  placeholder="Tell visitors about yourself..."
                  className="bg-card/50 border-border min-h-[80px] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Color Customization Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-500 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colors
            </h2>
            
            <div className="border border-border rounded-xl p-4 md:p-6 space-y-4 bg-card/30">
              {/* Color inputs in grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Text Color (General) */}
                <div>
                  <Label className="text-sm mb-1.5 block">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile?.text_color || "#FFFFFF"}
                      onChange={(e) => updateProfile({ text_color: e.target.value })}
                      placeholder="#FFFFFF"
                      className="bg-card/50 border-border flex-1 text-sm"
                    />
                    <input
                      type="color"
                      value={profile?.text_color?.startsWith('#') ? profile.text_color : "#FFFFFF"}
                      onChange={(e) => updateProfile({ text_color: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">General text color for your profile</p>
                </div>

                {/* Username Color */}
                <div>
                  <Label className="text-sm mb-1.5 block">Username Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile?.display_name_color || "#FFFFFF"}
                      onChange={(e) => updateProfile({ display_name_color: e.target.value })}
                      placeholder="#FFFFFF"
                      className="bg-card/50 border-border flex-1 text-sm"
                    />
                    <input
                      type="color"
                      value={profile?.display_name_color?.startsWith('#') ? profile.display_name_color : "#FFFFFF"}
                      onChange={(e) => updateProfile({ display_name_color: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Bio Color */}
                <div>
                  <Label className="text-sm mb-1.5 block">Bio Color</Label>
                  <div className="flex gap-2">
                    <Input
                      value={profile?.bio_color || "#FFFFFF"}
                      onChange={(e) => updateProfile({ bio_color: e.target.value })}
                      placeholder="#FFFFFF"
                      className="bg-card/50 border-border flex-1 text-sm"
                    />
                    <input
                      type="color"
                      value={profile?.bio_color?.startsWith('#') ? profile.bio_color : "#FFFFFF"}
                      onChange={(e) => updateProfile({ bio_color: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Border Customization Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Square className="w-5 h-5" />
              Border
            </h2>
            
            <div className="border border-border rounded-xl p-4 md:p-6 space-y-4 bg-card/30">
              {/* Profile Border Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Enable Border</Label>
                <Switch
                  checked={profile?.border_enabled ?? false}
                  onCheckedChange={(checked) => updateProfile({ border_enabled: checked })}
                />
              </div>

              {profile?.border_enabled && (
                <>
                  {/* Border Effect Selector */}
                  <BorderEffectSelector
                    selectedEffect={profile?.border_effect || "default"}
                    onEffectChange={(effect) => updateProfile({ border_effect: effect })}
                  />
                </>
              )}
            </div>
          </div>

          {/* Theme Selection Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-500 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Theme
            </h2>
            
            <div className="border border-border rounded-xl p-4 md:p-6 bg-card/30">
              <ThemeSelector
                selectedTheme={profile?.theme || "default"}
                onThemeChange={(theme) => updateProfile({ theme })}
              />
            </div>
          </div>

          {/* Social Cards Section - Available for all themes */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-pink-500 flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Social Cards
            </h2>
            
            <div className="border border-border rounded-xl p-4 md:p-6 bg-card/30">
              <SocialCardsEditor profileId={profile?.id} />
            </div>
          </div>

          {/* Portfolio Theme Features - Only visible for Portfolio theme */}
          {profile?.theme === "portfolio" && (
            <>
              {/* Projects Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <FolderKanban className="w-5 h-5" />
                  Portfolio Settings
                </h2>
                
                <div className="border border-border rounded-xl p-4 md:p-6 bg-card/30 space-y-4">
                  <ProjectsEditor
                    profileId={profile?.id}
                    projects={projects}
                    onProjectsChange={() => loadProjects(profile?.id)}
                  />

                  {/* Projects Customization */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Projects Section
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-sm mb-1.5 block">Section Title</Label>
                        <Input
                          value={profile?.projects_title || "Projects"}
                          onChange={(e) => updateProfile({ projects_title: e.target.value })}
                          placeholder="Projects"
                          className="bg-card/50 border-border text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-sm mb-1.5 block">Section Description</Label>
                        <Textarea
                          value={profile?.projects_description || ""}
                          onChange={(e) => updateProfile({ projects_description: e.target.value })}
                          placeholder="Describe your projects section..."
                          className="bg-card/50 border-border text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coding Badges Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Coding Badges
                </h2>
                
                <div className="border border-border rounded-xl p-4 md:p-6 bg-card/30">
                  <CodingBadgesEditor
                    selectedBadges={profile?.coding_badges || []}
                    onBadgesChange={(badges) => updateProfile({ coding_badges: badges })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Changes Bar */}
      <SaveChangesBar
        hasChanges={hasChanges}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      {/* Manager Modals */}
      {showAvatarManager && (
        <AvatarManager
          open={showAvatarManager}
          onClose={() => setShowAvatarManager(false)}
          currentAvatar={profile?.avatar_url}
          onAvatarChange={(url) => {
            updateProfile({ avatar_url: url });
            setShowAvatarManager(false);
          }}
          discordUserId={profile?.discord_user_id}
          discordAvatarSync={profile?.discord_avatar_sync ?? false}
          discordDecorationSync={profile?.discord_decoration_sync ?? false}
          onDiscordAvatarSyncChange={(enabled) => updateProfile({ discord_avatar_sync: enabled })}
          onDiscordDecorationSyncChange={(enabled) => updateProfile({ discord_decoration_sync: enabled })}
        />
      )}

      <BackgroundManager
        open={showBackgroundManager}
        onClose={() => setShowBackgroundManager(false)}
        currentBackground={profile?.background_url}
        backgroundType={profile?.background_type}
        backgrounds={profile?.backgrounds as any || []}
        backgroundShuffle={profile?.background_shuffle}
        backgroundLoop={profile?.background_loop}
        backgroundDuration={profile?.background_duration}
        onBackgroundChange={(url, type) => updateProfile({ background_url: url, background_type: type })}
        onSettingsChange={(settings) => updateProfile(settings)}
      />

      <AudioManager
        open={showAudioManager}
        onClose={() => setShowAudioManager(false)}
        profileId={profile?.id}
        audioShuffle={profile?.audio_shuffle}
        showAudioPlayer={profile?.show_audio_player}
        audioSticky={profile?.audio_sticky}
        onSettingsChange={(settings) => updateProfile(settings)}
      />

      <CursorManager
        open={showCursorManager}
        onClose={() => setShowCursorManager(false)}
        currentCursor={profile?.custom_cursor}
        onCursorChange={(url) => updateProfile({ custom_cursor: url })}
        trailingEnabled={profile?.cursor_trailing_enabled ?? false}
        onTrailingChange={(enabled) => updateProfile({ cursor_trailing_enabled: enabled })}
        trailCount={profile?.cursor_trail_count ?? 8}
        onTrailCountChange={(count) => updateProfile({ cursor_trail_count: count })}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
