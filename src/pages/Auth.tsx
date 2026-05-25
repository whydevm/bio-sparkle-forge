import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, KeyRound, User, Fingerprint, Lock, Smartphone } from "lucide-react";
import PasswordStrength from "@/components/PasswordStrength";

type Method = "password" | "otp" | "passkey";
const LAST_METHOD_KEY = "soulgg:last-login-method";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [method, setMethod] = useState<Method>("password");
  const [lastMethod, setLastMethod] = useState<Method | "google" | "apple" | null>(null);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // otp
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(LAST_METHOD_KEY) as any;
    if (saved) setLastMethod(saved);
    if (saved === "otp" || saved === "passkey") setMethod(saved);
  }, []);

  const rememberMethod = (m: string) => {
    localStorage.setItem(LAST_METHOD_KEY, m);
  };

  const ensureProfile = async (userId: string, fallbackUsername?: string) => {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing) {
      await supabase.from("profiles").insert({
        user_id: userId,
        username: fallbackUsername || `user_${userId.slice(0, 8)}`,
      });
    }
  };

  const handlePassword = async () => {
    if (isSignUp && !agreedToTerms) {
      toast.error("Please agree to Terms & Privacy Policy");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username },
          },
        });
        if (error) throw error;
        if (data.user) {
          await ensureProfile(data.user.id, username);
          rememberMethod("password");
          toast.success("Check your email to verify your account");
          navigate("/dashboard");
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) await ensureProfile(data.user.id);
        rememberMethod("password");
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/`, shouldCreateUser: true },
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code sent — check your email");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return toast.error("Enter the 6-digit code");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      });
      if (error) throw error;
      if (data.user) await ensureProfile(data.user.id);
      rememberMethod("otp");
      toast.success("Signed in!");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(String(result.error));
      rememberMethod(provider);
      if (result.redirected) return;
      navigate("/dashboard");
    } catch (e: any) {
      toast.error(e.message || "OAuth failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasskey = async () => {
    toast.info("Passkey sign-in is coming soon — use email or OAuth for now");
  };

  const MethodTab = ({ id, label, icon: Icon }: { id: Method; label: string; icon: any }) => {
    const active = method === id;
    const isLast = lastMethod === id;
    return (
      <button
        type="button"
        onClick={() => setMethod(id)}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
          active
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
        }`}
      >
        {isLast && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shadow-md">
            Last Used
          </span>
        )}
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-2xl space-y-6 animate-fade-in">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-primary text-5xl">🔫</div>
            <h1 className="text-2xl font-bold">
              {isSignUp ? "Create your soul.gg account" : "Account Login"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Sign up to claim your bio link" : "Choose your preferred login method to get started"}
            </p>
          </div>

          {/* Method tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-accent/30 border border-border/40 relative">
            <MethodTab id="password" label="Password" icon={Lock} />
            <MethodTab id="otp" label="OTP" icon={Smartphone} />
            <MethodTab id="passkey" label="Passkey" icon={Fingerprint} />
          </div>

          {/* Password */}
          {method === "password" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label>E-Mail</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Password</Label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {isSignUp && password && <PasswordStrength password={password} />}
              </div>
              {isSignUp && (
                <div>
                  <Label>Username</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="soul.gg/"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              {isSignUp && (
                <div className="flex items-center gap-2">
                  <Checkbox checked={agreedToTerms} onCheckedChange={(c) => setAgreedToTerms(c as boolean)} />
                  <label className="text-sm text-muted-foreground">I agree to ToS & Privacy Policy</label>
                </div>
              )}
              <Button onClick={handlePassword} disabled={loading} className="w-full py-6 text-base">
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </div>
          )}

          {/* OTP */}
          {method === "otp" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label>E-Mail</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={otpSent}
                  />
                </div>
              </div>
              {otpSent && (
                <div>
                  <Label>Verification Code</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 text-center text-lg tracking-widest"
                  />
                </div>
              )}
              {!otpSent ? (
                <Button onClick={handleSendOtp} disabled={loading} className="w-full py-6 text-base">
                  {loading ? "Sending..." : "Send Code"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button onClick={handleVerifyOtp} disabled={loading} className="w-full py-6 text-base">
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <Button variant="ghost" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="w-full text-xs">
                    Use a different email
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Passkey */}
          {method === "passkey" && (
            <div className="space-y-4 animate-fade-in text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Fingerprint className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Sign in instantly using your device's biometric or security key.
              </p>
              <Button onClick={handlePasskey} className="w-full py-6 text-base">
                Continue with Passkey
              </Button>
            </div>
          )}

          {/* OAuth */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-card text-muted-foreground">or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleOAuth("google")}
                disabled={loading}
                className="relative gap-2"
              >
                {lastMethod === "google" && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                    Last Used
                  </span>
                )}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth("apple")}
                disabled={loading}
                className="relative gap-2"
              >
                {lastMethod === "apple" && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-semibold shadow-md">
                    Last Used
                  </span>
                )}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Already have an account? " : "Need an account? "}
              <span className="text-primary font-semibold">{isSignUp ? "Sign In" : "Sign Up"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
