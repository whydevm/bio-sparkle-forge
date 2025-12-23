import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const AccountSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Edit states
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setNewUsername(profileData.username);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(newUsername)) {
      toast.error("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    setSaving(true);
    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", newUsername.toLowerCase())
        .neq("id", profile.id)
        .single();

      if (existing) {
        toast.error("Username is already taken");
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.toLowerCase() })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, username: newUsername.toLowerCase() });
      toast.success("Username updated successfully!");
      setShowUsernameDialog(false);
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast.success("Email update initiated! Check your new email for confirmation.");
      setShowEmailDialog(false);
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout username={profile.username}>
      <div className="container max-w-2xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-semibold">Account Settings</h1>

        {/* General Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">General Information</h2>
          
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Username
              </Label>
              <div className="flex gap-2">
                <Input value={`/${profile.username}`} disabled className="flex-1" />
                <Button variant="outline" onClick={() => setShowUsernameDialog(true)}>
                  Edit
                </Button>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email
              </Label>
              <div className="flex items-center gap-2">
                <Input type="email" value={user.email} disabled className="flex-1" />
                <Button variant="outline" onClick={() => {
                  setNewEmail(user.email);
                  setShowEmailDialog(true);
                }}>
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Security Settings</h2>
          
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium">Multi-factor authentication</div>
                <div className="text-sm text-muted-foreground">
                  Multi-factor authentication adds a layer of security to your account
                </div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Account Actions</h2>
          
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                By changing your password, you will be logged out of every device.
              </p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </div>

            <Button
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Username</Label>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Only letters, numbers, underscores and hyphens allowed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUsername} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newemail@example.com"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                A confirmation email will be sent to your new address
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmail} disabled={saving}>
              {saving ? "Saving..." : "Update Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} disabled={saving}>
              {saving ? "Saving..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AccountSettings;
