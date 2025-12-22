import { Button } from "@/components/ui/button";

interface SaveChangesBarProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  saving?: boolean;
}

const SaveChangesBar = ({ hasChanges, onSave, onReset, saving }: SaveChangesBarProps) => {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-card border border-border shadow-lg backdrop-blur-sm">
        <span className="text-foreground font-medium">You have unsaved changes!</span>
        <Button
          variant="ghost"
          onClick={onReset}
          disabled={saving}
        >
          Reset
        </Button>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default SaveChangesBar;