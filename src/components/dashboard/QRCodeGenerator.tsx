import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

const QRCodeGenerator = ({ open, onClose, username }: QRCodeGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/${username}`;
  
  // Generate QR code using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(profileUrl)}&bgcolor=000000&color=ffffff`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${username}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center">Share Your Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl">
            <img 
              src={qrCodeUrl} 
              alt="Profile QR Code" 
              className="w-48 h-48"
            />
          </div>

          {/* Profile URL */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Your profile link</p>
            <p className="font-mono text-sm bg-muted px-3 py-2 rounded-lg">
              soul.gg/{username}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
