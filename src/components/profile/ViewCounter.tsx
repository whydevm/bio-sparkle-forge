import { Eye } from "lucide-react";

interface ViewCounterProps {
  count: number;
}

const ViewCounter = ({ count }: ViewCounterProps) => {
  return (
    <div className="fixed bottom-4 left-4 glass-panel px-4 py-2 rounded-full flex items-center gap-2 z-50">
      <Eye className="w-4 h-4" />
      <span className="text-sm font-medium">{count.toLocaleString()}</span>
    </div>
  );
};

export default ViewCounter;