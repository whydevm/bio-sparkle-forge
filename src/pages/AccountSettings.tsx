import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AccountSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
              <Input value={profile.username} disabled />
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Display Name
              </Label>
              <Input placeholder="Display Name" />
            </div>

            <div>
              <Label className="mb-2">Alias</Label>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="text-primary font-medium">Want more? Unlock with Premium</div>
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
                <Button variant="ghost" size="icon">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
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
            <p className="text-sm text-muted-foreground">
              Recovery codes are one-time use. Used codes can't be reused.
            </p>
            
            <Button variant="secondary" className="w-full">
              Regenerate Recovery Codes
            </Button>

            <Button variant="secondary" className="w-full">
              Change Email
            </Button>

            <div>
              <p className="text-sm text-muted-foreground mb-3">
                By changing your password, you will be logged out of every device.
              </p>
            <Button variant="secondary" className="w-full">
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
    </DashboardLayout>
  );
};

export default AccountSettings;
