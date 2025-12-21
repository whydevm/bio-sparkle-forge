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
import { User, Image, Music, MousePointer, Settings, Palette, Square, RotateCcw, Code2 } from "lucide-react";
import CodingBadgesEditor from "@/components/dashboard/CodingBadgesEditor";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateProfile = (updates: Partial<typeof profile>) => {
    setProfile({ ...profile, ...updates });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout username={profile?.username}>
      <div className="p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Main Manager Cards */}
          <div className="space-y-4">
            {/* Avatar Card */}
            <div
              onClick={() => setShowAvatarManager(true)}
              className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px] bg-card/30"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-sm">Click or Drop a Avatar</span>
            </div>

            {/* Background Card */}
            <div
              onClick={() => setShowBackgroundManager(true)}
              className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px] bg-card/30"
            >
              {profile?.background_url ? (
                profile?.background_type === "video" ? (
                  <video src={profile.background_url} className="w-24 h-16 object-cover rounded" />
                ) : (
                  <img src={profile.background_url} alt="Background" className="w-24 h-16 object-cover rounded" />
                )
              ) : (
                <Image className="w-12 h-12 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-sm">Click to open background manager</span>
            </div>

            {/* Audio Card */}
            <div
              onClick={() => setShowAudioManager(true)}
              className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px] bg-card/30"
            >
              <Music className="w-12 h-12 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Click to open audio manager</span>
            </div>

            {/* Cursor Card */}
            <div
              onClick={() => setShowCursorManager(true)}
              className="border border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-colors min-h-[160px] bg-card/30"
            >
              {profile?.custom_cursor ? (
                <img src={profile.custom_cursor} alt="Cursor" className="w-12 h-12 object-contain" />
              ) : (
                <MousePointer className="w-12 h-12 text-muted-foreground" />
              )}
              <span className="text-muted-foreground text-sm">Click to open cursor manager</span>
            </div>
          </div>

          {/* General Customization Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Settings className="w-6 h-6" />
              General Customization
            </h2>
            
            <div className="border border-border rounded-xl p-6 space-y-6 bg-card/30">
              {/* Cycling Bio Toggle */}
              <div className="flex items-center justify-between">
                <Label>Enable Cycling Bio (Typewriter)</Label>
                <Switch
                  checked={profile?.cycling_bio_enabled ?? false}
                  onCheckedChange={(checked) => updateProfile({ cycling_bio_enabled: checked })}
                />
              </div>

              {/* Description / Bio Texts */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>{profile?.cycling_bio_enabled ? "Bio Texts (one per line)" : "Description"}</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.bio || "").length}/200</span>
                </div>
                {profile?.cycling_bio_enabled ? (
                  <Textarea
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile({ bio: e.target.value.slice(0, 200) })}
                    placeholder="Enter multiple bio texts (one per line)&#10;Example:&#10;Developer&#10;Designer&#10;Creator"
                    className="bg-card/50 border-border min-h-[100px]"
                  />
                ) : (
                  <Input
                    value={profile?.bio || ""}
                    onChange={(e) => updateProfile({ bio: e.target.value.slice(0, 200) })}
                    placeholder="Enter your description"
                    className="bg-card/50 border-border"
                  />
                )}
                {profile?.cycling_bio_enabled && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Each line will cycle with a typewriter animation
                  </p>
                )}
              </div>

              {/* Avatar Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Avatar Radius</Label>
                  <span className="text-xs bg-card px-2 py-1 rounded">{profile?.avatar_radius ?? 100}</span>
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Profile Opacity</Label>
                  <Palette className="w-4 h-4 text-muted-foreground" />
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

              {/* Profile Blur */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Profile Blur</Label>
                  <Palette className="w-4 h-4 text-muted-foreground" />
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Background Effects</Label>
                  <div className="flex gap-1">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Select
                  value={profile?.background_effect || "none"}
                  onValueChange={(value) => updateProfile({ background_effect: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="particles">Particles</SelectItem>
                    <SelectItem value="snow">Snow</SelectItem>
                    <SelectItem value="rain">Rain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Username Effects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Username Effects</Label>
                  <div className="flex gap-1">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Select
                  value={profile?.username_effect || "none"}
                  onValueChange={(value) => updateProfile({ username_effect: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border">
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Location</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.location || "").length}/32</span>
                </div>
                <Input
                  value={profile?.location || ""}
                  onChange={(e) => updateProfile({ location: e.target.value.slice(0, 32) })}
                  placeholder="Enter your location"
                  className="bg-card/50 border-border"
                />
              </div>

              {/* Entry Text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1">
                    Enter Text
                    <span className="text-lg">😉</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{(profile?.entry_text || "").length}/100</span>
                </div>
                <Input
                  value={profile?.entry_text || ""}
                  onChange={(e) => updateProfile({ entry_text: e.target.value.slice(0, 100) })}
                  placeholder="Click to Enter"
                  className="bg-card/50 border-border"
                />
              </div>

              {/* Display Name Font */}
              <div>
                <Label className="mb-2 block">Display Name Font</Label>
                <Select
                  value={profile?.display_name_font || "font-sans"}
                  onValueChange={(value) => updateProfile({ display_name_font: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="font-sans">Inter (Default)</SelectItem>
                    <SelectItem value="font-roboto">Roboto</SelectItem>
                    <SelectItem value="font-poppins">Poppins</SelectItem>
                    <SelectItem value="font-montserrat">Montserrat</SelectItem>
                    <SelectItem value="font-lato">Lato</SelectItem>
                    <SelectItem value="font-opensans">Open Sans</SelectItem>
                    <SelectItem value="font-raleway">Raleway</SelectItem>
                    <SelectItem value="font-ubuntu">Ubuntu</SelectItem>
                    <SelectItem value="font-nunito">Nunito</SelectItem>
                    <SelectItem value="font-quicksand">Quicksand</SelectItem>
                    <SelectItem value="font-worksans">Work Sans</SelectItem>
                    <SelectItem value="font-oswald">Oswald</SelectItem>
                    <SelectItem value="font-spacegrotesk">Space Grotesk</SelectItem>
                    <SelectItem value="font-playfair">Playfair Display</SelectItem>
                    <SelectItem value="font-merriweather">Merriweather</SelectItem>
                    <SelectItem value="font-crimson">Crimson Text</SelectItem>
                    <SelectItem value="font-cormorant">Cormorant Garamond</SelectItem>
                    <SelectItem value="font-librebaskerville">Libre Baskerville</SelectItem>
                    <SelectItem value="font-mono">JetBrains Mono</SelectItem>
                    <SelectItem value="font-firacode">Fira Code</SelectItem>
                    <SelectItem value="font-sourcecodepro">Source Code Pro</SelectItem>
                    <SelectItem value="font-robotomono">Roboto Mono</SelectItem>
                    <SelectItem value="font-lobster">Lobster</SelectItem>
                    <SelectItem value="font-pacifico">Pacifico</SelectItem>
                    <SelectItem value="font-permanentmarker">Permanent Marker</SelectItem>
                    <SelectItem value="font-bebasneue">Bebas Neue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bio Font */}
              <div>
                <Label className="mb-2 block">Bio Font</Label>
                <Select
                  value={profile?.bio_font || "font-sans"}
                  onValueChange={(value) => updateProfile({ bio_font: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="font-sans">Inter (Default)</SelectItem>
                    <SelectItem value="font-roboto">Roboto</SelectItem>
                    <SelectItem value="font-poppins">Poppins</SelectItem>
                    <SelectItem value="font-montserrat">Montserrat</SelectItem>
                    <SelectItem value="font-lato">Lato</SelectItem>
                    <SelectItem value="font-opensans">Open Sans</SelectItem>
                    <SelectItem value="font-raleway">Raleway</SelectItem>
                    <SelectItem value="font-ubuntu">Ubuntu</SelectItem>
                    <SelectItem value="font-nunito">Nunito</SelectItem>
                    <SelectItem value="font-quicksand">Quicksand</SelectItem>
                    <SelectItem value="font-mono">JetBrains Mono</SelectItem>
                    <SelectItem value="font-playfair">Playfair Display</SelectItem>
                    <SelectItem value="font-merriweather">Merriweather</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* About Me */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>About Me</Label>
                  <span className="text-xs text-muted-foreground">{(profile?.about_me || "").length}/500</span>
                </div>
                <Textarea
                  value={profile?.about_me || ""}
                  onChange={(e) => updateProfile({ about_me: e.target.value.slice(0, 500) })}
                  placeholder="Tell visitors about yourself..."
                  className="bg-card/50 border-border min-h-[100px]"
                />
              </div>

              {/* Toggle options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Glow Username</Label>
                  <Switch
                    checked={profile?.glow_username}
                    onCheckedChange={(checked) => updateProfile({ glow_username: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Glow Socials</Label>
                  <Switch
                    checked={profile?.glow_socials}
                    onCheckedChange={(checked) => updateProfile({ glow_socials: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Monochrome Icons</Label>
                  <Switch
                    checked={profile?.monochrome_icons}
                    onCheckedChange={(checked) => updateProfile({ monochrome_icons: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Glow Badges</Label>
                  <Switch
                    checked={profile?.glow_badges}
                    onCheckedChange={(checked) => updateProfile({ glow_badges: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Customization Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Color Customization
            </h2>
            
            <div className="border border-border rounded-xl p-6 space-y-6 bg-card/30">
              {/* Username Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1">
                    Username Color
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.display_name_color || "#FFFFFF"}
                    onChange={(e) => updateProfile({ display_name_color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="bg-card/50 border-border flex-1"
                  />
                  <input
                    type="color"
                    value={profile?.display_name_color?.startsWith('#') ? profile.display_name_color : "#FFFFFF"}
                    onChange={(e) => updateProfile({ display_name_color: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Bio Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1">
                    Bio & About Me Color
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.bio_color || "#DDDDDD"}
                    onChange={(e) => updateProfile({ bio_color: e.target.value })}
                    placeholder="#DDDDDD"
                    className="bg-card/50 border-border flex-1"
                  />
                  <input
                    type="color"
                    value={profile?.bio_color?.startsWith('#') ? profile.bio_color : "#DDDDDD"}
                    onChange={(e) => updateProfile({ bio_color: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1">
                    Accent Color
                    <Palette className="w-4 h-4 text-muted-foreground" />
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.accent_color || "#FFFFFF"}
                    onChange={(e) => updateProfile({ accent_color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="bg-card/50 border-border flex-1"
                  />
                  <input
                    type="color"
                    value={profile?.accent_color?.startsWith('#') ? profile.accent_color : "#FFFFFF"}
                    onChange={(e) => updateProfile({ accent_color: e.target.value })}
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Text Color</Label>
                  <Palette className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.text_color || "#FFFFFF"}
                    onChange={(e) => updateProfile({ text_color: e.target.value })}
                    placeholder="#FFFFFF"
                    className="bg-card/50 border-border flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border"
                    style={{ backgroundColor: profile?.text_color || "#FFFFFF" }}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Background Color</Label>
                  <Palette className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.background_color || "#030303"}
                    onChange={(e) => updateProfile({ background_color: e.target.value })}
                    placeholder="#030303"
                    className="bg-card/50 border-border flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border"
                    style={{ backgroundColor: profile?.background_color || "#030303" }}
                  />
                </div>
              </div>

              {/* Secondary Text Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Secondary Text Color</Label>
                  <Palette className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.secondary_text_color || "#DDDDDD"}
                    onChange={(e) => updateProfile({ secondary_text_color: e.target.value })}
                    placeholder="#DDDDDD"
                    className="bg-card/50 border-border flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border"
                    style={{ backgroundColor: profile?.secondary_text_color || "#DDDDDD" }}
                  />
                </div>
              </div>

              {/* Gradient Section */}
              <div>
                <Label className="mb-3 block">Gradient</Label>
                <Button
                  variant={profile?.gradient_enabled ? "default" : "outline"}
                  onClick={() => updateProfile({ gradient_enabled: !profile?.gradient_enabled })}
                  className={profile?.gradient_enabled ? "w-full bg-green-600 hover:bg-green-700" : "w-full border-primary text-primary"}
                >
                  {profile?.gradient_enabled ? "Profile Gradient Enabled" : "Enable Profile Gradient"}
                </Button>
              </div>

              {profile?.gradient_enabled && (
                <>
                  {/* Gradient Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Primary Color</Label>
                        <Palette className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={profile?.gradient_primary || "#0d0d0c"}
                          onChange={(e) => updateProfile({ gradient_primary: e.target.value })}
                          placeholder="#0d0d0c"
                          className="bg-card/50 border-border flex-1"
                        />
                        <div 
                          className="w-10 h-10 rounded border border-border"
                          style={{ backgroundColor: profile?.gradient_primary || "#0d0d0c" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Secondary Color</Label>
                        <Palette className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={profile?.gradient_secondary || "#26262"}
                          onChange={(e) => updateProfile({ gradient_secondary: e.target.value })}
                          placeholder="#26262"
                          className="bg-card/50 border-border flex-1"
                        />
                        <div 
                          className="w-10 h-10 rounded border border-border"
                          style={{ backgroundColor: profile?.gradient_secondary || "#26262" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Angle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Gradient Angle</Label>
                      <Palette className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <Slider
                      value={[profile?.gradient_angle ?? 45]}
                      onValueChange={([value]) => updateProfile({ gradient_angle: value })}
                      max={360}
                      min={0}
                      step={1}
                      className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Border Customization Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Square className="w-6 h-6" />
              Border Customization
            </h2>
            
            <div className="border border-border rounded-xl p-6 space-y-6 bg-card/30">
              {/* Profile Border Toggle */}
              <div>
                <Label className="mb-3 block">Profile Border</Label>
                <Button
                  variant={profile?.border_enabled ? "default" : "outline"}
                  onClick={() => updateProfile({ border_enabled: !profile?.border_enabled })}
                  className={profile?.border_enabled ? "w-full bg-green-600 hover:bg-green-700" : "w-full border-destructive text-destructive"}
                >
                  {profile?.border_enabled ? "Border Enabled" : "Border Disabled"}
                </Button>
              </div>

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Radius</Label>
                  <button onClick={() => updateProfile({ border_radius: 16 })} className="p-1 hover:bg-muted rounded">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Slider
                  value={[profile?.border_radius ?? 16]}
                  onValueChange={([value]) => updateProfile({ border_radius: value })}
                  max={50}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>

              {/* Border Color */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Color</Label>
                  <button onClick={() => updateProfile({ border_color: "#ffffff" })} className="p-1 hover:bg-muted rounded">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={profile?.border_color || "#ffffff"}
                    onChange={(e) => updateProfile({ border_color: e.target.value })}
                    placeholder="#ffffff"
                    className="bg-card/50 border-border flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border border-border"
                    style={{ backgroundColor: profile?.border_color || "#ffffff" }}
                  />
                </div>
              </div>

              {/* Border Style */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Style</Label>
                  <button onClick={() => updateProfile({ border_style: "solid" })} className="p-1 hover:bg-muted rounded">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Select
                  value={profile?.border_style || "solid"}
                  onValueChange={(value) => updateProfile({ border_style: value })}
                >
                  <SelectTrigger className="bg-card/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid</SelectItem>
                    <SelectItem value="dashed">Dashed</SelectItem>
                    <SelectItem value="dotted">Dotted</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border Width */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Width</Label>
                  <button onClick={() => updateProfile({ border_width: 1 })} className="p-1 hover:bg-muted rounded">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Slider
                  value={[profile?.border_width ?? 1]}
                  onValueChange={([value]) => updateProfile({ border_width: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>

              {/* Border Opacity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Opacity</Label>
                  <button onClick={() => updateProfile({ border_opacity: 100 })} className="p-1 hover:bg-muted rounded">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Slider
                  value={[profile?.border_opacity ?? 100]}
                  onValueChange={([value]) => updateProfile({ border_opacity: value })}
                  max={100}
                  min={0}
                  step={1}
                  className="[&>span:first-child]:bg-muted [&_[role=slider]]:bg-primary [&>span:first-child>span]:bg-primary"
                />
              </div>
            </div>
          </div>

          {/* Coding Badges Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-500 flex items-center gap-2">
              <Code2 className="w-6 h-6" />
              Coding Badges
            </h2>
            
            <div className="border border-border rounded-xl p-6 bg-card/30">
              <CodingBadgesEditor
                selectedBadges={profile?.coding_badges || []}
                onBadgesChange={(badges) => updateProfile({ coding_badges: badges })}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full" size="lg">
            Save Changes
          </Button>
        </div>
      </div>

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
        />
      )}

      <BackgroundManager
        open={showBackgroundManager}
        onClose={() => setShowBackgroundManager(false)}
        currentBackground={profile?.background_url}
        backgroundType={profile?.background_type}
        onBackgroundChange={(url, type) => updateProfile({ background_url: url, background_type: type })}
      />

      <AudioManager
        open={showAudioManager}
        onClose={() => setShowAudioManager(false)}
        profileId={profile?.id}
        audioShuffle={profile?.audio_shuffle}
        showAudioPlayer={profile?.show_audio_player}
        onSettingsChange={(settings) => updateProfile(settings)}
      />

      <CursorManager
        open={showCursorManager}
        onClose={() => setShowCursorManager(false)}
        currentCursor={profile?.custom_cursor}
        onCursorChange={(url) => updateProfile({ custom_cursor: url })}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
