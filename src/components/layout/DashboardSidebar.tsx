import { X, User, Palette, Link, Diamond, Image, FileText, HelpCircle, ExternalLink, Share2, ImageIcon, QrCode, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import QRCodeGenerator from "@/components/dashboard/QRCodeGenerator";
import ProfileShareBanner from "@/components/dashboard/ProfileShareBanner";
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

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

const DashboardSidebar = ({ open, onClose, username, displayName, avatarUrl, bio }: DashboardSidebarProps) => {
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border z-50 animate-slide-in-right overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-primary text-2xl">🔫</div>
              <span className="text-xl font-bold">
                soul<span className="text-primary">.</span>gg
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            {/* Account */}
            <div>
              <button
                onClick={() => setAccountExpanded(!accountExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span>account</span>
                </div>
                <span className="text-xs">{accountExpanded ? "▲" : "▼"}</span>
              </button>
              
              {accountExpanded && (
                <div className="ml-8 mt-2 space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => { navigate("/account/overview"); onClose(); }}
                  >
                    Overview
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => { navigate("/account/analytics"); onClose(); }}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => { navigate("/account/badges"); onClose(); }}
                  >
                    Badges
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => { navigate("/account/settings"); onClose(); }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>

            {/* Customize */}
            <button
              onClick={() => { navigate("/dashboard"); onClose(); }}
              className="w-full flex items-center gap-3 p-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
            >
              <Palette className="w-5 h-5" />
              <span>customize</span>
            </button>

            {/* Links */}
            <button
              onClick={() => { navigate("/links"); onClose(); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
            >
              <Link className="w-5 h-5" />
              <span>links</span>
            </button>

            {/* Assets */}
            <button
              onClick={() => { navigate("/assets"); onClose(); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              <span>assets</span>
            </button>

            {/* Premium */}
            <button className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors">
              <Diamond className="w-5 h-5" />
              <span>premium</span>
            </button>

            {/* Image Host */}
            <button className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors">
              <Image className="w-5 h-5" />
              <span>image host</span>
            </button>

            {/* Templates */}
            <button className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
              <span>templates</span>
            </button>
          </div>

          {/* Bottom buttons */}
          <div className="space-y-3 pt-6">
            <Button variant="outline" className="w-full justify-start gap-3">
              <HelpCircle className="w-5 h-5" />
              Help Center
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => { navigate(`/${username}`); onClose(); }}
            >
              <ExternalLink className="w-5 h-5" />
              My Page
            </Button>

            <Button 
              className="w-full justify-start gap-3"
              onClick={() => setShowQRCode(true)}
            >
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </Button>

            <Button 
              className="w-full justify-start gap-3" 
              variant="secondary"
              onClick={() => setShowShareBanner(true)}
            >
              <Share2 className="w-5 h-5" />
              Share Your Profile
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Generator Dialog */}
      <QRCodeGenerator
        open={showQRCode}
        onClose={() => setShowQRCode(false)}
        username={username || ""}
      />

      {/* Profile Share Banner Dialog */}
      <ProfileShareBanner
        open={showShareBanner}
        onClose={() => setShowShareBanner(false)}
        username={username || ""}
        displayName={displayName}
        avatarUrl={avatarUrl}
        bio={bio}
      />
    </>
  );
};

export default DashboardSidebar;
