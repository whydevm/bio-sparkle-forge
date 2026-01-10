import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Clock, Globe } from "lucide-react";

interface JoinDateEditorProps {
  createdAt: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  onSettingsChange: (settings: {
    join_date_format?: string;
    join_time_format?: string;
    join_timezone?: string;
  }) => void;
}

const JoinDateEditor = ({ 
  createdAt, 
  dateFormat = "MMM dd, yyyy",
  timeFormat = "12h",
  timezone = "UTC",
  onSettingsChange 
}: JoinDateEditorProps) => {
  const date = new Date(createdAt);

  const dateFormats = [
    { value: "MMM dd, yyyy", label: "Jan 01, 2025" },
    { value: "dd/MM/yyyy", label: "01/01/2025 (DD/MM)" },
    { value: "MM/dd/yyyy", label: "01/01/2025 (MM/DD)" },
    { value: "yyyy-MM-dd", label: "2025-01-01" },
    { value: "MMMM dd, yyyy", label: "January 01, 2025" },
    { value: "dd MMMM yyyy", label: "01 January 2025" },
    { value: "EEE, MMM dd", label: "Wed, Jan 01" },
    { value: "EEEE, MMMM dd, yyyy", label: "Wednesday, January 01, 2025" },
  ];

  const timeFormats = [
    { value: "12h", label: "12 Hour (AM/PM)" },
    { value: "24h", label: "24 Hour" },
    { value: "none", label: "No Time" },
  ];

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
  ];

  const getPreviewDate = () => {
    try {
      let formatted = format(date, dateFormat);
      if (timeFormat === "12h") {
        formatted += ` ${format(date, "h:mm a")}`;
      } else if (timeFormat === "24h") {
        formatted += ` ${format(date, "HH:mm")}`;
      }
      return formatted;
    } catch {
      return format(date, "MMM dd, yyyy");
    }
  };

  return (
    <div className="space-y-3">
      {/* Date Format */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Date Format</Label>
          <Select
            value={dateFormat}
            onValueChange={(value) => onSettingsChange({ join_date_format: value })}
          >
            <SelectTrigger className="h-8 bg-transparent border-0 p-0 text-sm focus:ring-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time Format */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Time Format</Label>
          <Select
            value={timeFormat}
            onValueChange={(value) => onSettingsChange({ join_time_format: value })}
          >
            <SelectTrigger className="h-8 bg-transparent border-0 p-0 text-sm focus:ring-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeFormats.map((fmt) => (
                <SelectItem key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timezone */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border">
        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Timezone</Label>
          <Select
            value={timezone}
            onValueChange={(value) => onSettingsChange({ join_timezone: value })}
          >
            <SelectTrigger className="h-8 bg-transparent border-0 p-0 text-sm focus:ring-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-1">Preview</p>
        <p className="text-sm font-medium">{getPreviewDate()}</p>
      </div>
    </div>
  );
};

export default JoinDateEditor;