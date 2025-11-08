interface ProfileAvatarProps {
  avatarUrl?: string;
  decorationUrl?: string;
  displayName: string;
}

const ProfileAvatar = ({ avatarUrl, decorationUrl, displayName }: ProfileAvatarProps) => {
  return (
    <div className="relative w-32 h-32 mx-auto">
      {decorationUrl && (
        <img
          src={decorationUrl}
          alt="Avatar decoration"
          className="absolute inset-0 w-full h-full object-contain z-10"
        />
      )}
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/50">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;