interface DiscordStatusIconProps {
  status: "online" | "idle" | "dnd" | "offline";
  size?: number;
  className?: string;
}

const DiscordStatusIcon = ({ status, size = 16, className = "" }: DiscordStatusIconProps) => {
  // Real Discord status icons as SVGs
  const renderStatusIcon = () => {
    switch (status) {
      case "online":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <circle cx="12" cy="12" r="10" fill="#23a55a" />
          </svg>
        );
      case "idle":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <circle cx="12" cy="12" r="10" fill="#f0b232" />
            <circle cx="12" cy="12" r="5" fill="#000" fillOpacity="0" />
            <path
              d="M 16 12 A 6 6 0 1 1 12 6"
              fill="none"
              stroke="#23272a"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="10" fill="#f0b232" mask="url(#idle-mask)" />
            <defs>
              <mask id="idle-mask">
                <rect x="0" y="0" width="24" height="24" fill="white" />
                <circle cx="8" cy="8" r="6" fill="black" />
              </mask>
            </defs>
            {/* Moon cutout effect */}
            <circle cx="12" cy="12" r="10" fill="#f0b232" clipPath="url(#idle-clip)" />
            <clipPath id="idle-clip">
              <path d="M0 0h24v24H0z M8 2a8 8 0 100 16 8 8 0 000-16z" clipRule="evenodd" />
            </clipPath>
          </svg>
        );
      case "dnd":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <circle cx="12" cy="12" r="10" fill="#f23f43" />
            <rect x="6" y="10" width="12" height="4" rx="2" fill="#23272a" />
          </svg>
        );
      case "offline":
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
            <circle cx="12" cy="12" r="10" fill="#80848e" />
            <circle cx="12" cy="12" r="5" fill="#23272a" />
          </svg>
        );
      default:
        return null;
    }
  };

  return renderStatusIcon();
};

export default DiscordStatusIcon;
