interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 1) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (strength <= 2) return { level: 2, text: "Fair", color: "bg-orange-500" };
    if (strength <= 3) return { level: 3, text: "Good", color: "bg-yellow-500" };
    if (strength <= 4) return { level: 4, text: "Strong", color: "bg-green-500" };
    return { level: 5, text: "Very Strong", color: "bg-green-600" };
  };

  const strength = getStrength();
  
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded transition-colors ${
              level <= strength.level ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{strength.text}</span>
      </p>
    </div>
  );
};

export default PasswordStrength;
