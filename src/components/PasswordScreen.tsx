import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Heart, Sparkle, Stars } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PasswordScreenProps {
  onSuccess: () => void;
}

const PasswordScreen = ({ onSuccess }: PasswordScreenProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  // Handle input focus/blur
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Handle password validation
  const validatePassword = (password: string) => {
    return password === import.meta.env.VITE_WEB_APP_PASSWORD;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);

    if (!import.meta.env.VITE_WEB_APP_PASSWORD) {
      toast({
        title: "Configuration Error",
        description: "Password not configured. Please contact support.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate async validation
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (validatePassword(password)) {
      toast({
        title: "Password accepted!",
        description: "Let's get started 💕",
        duration: 1500,
      });
      onSuccess();
    } else {
      setIsError(true);
      toast({
        title: "Oops! That doesn't seem right.",
        description: "Try again, <3!",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-romantic-peach via-romantic-pink to-romantic-purple relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-200/20 via-purple-200/20 to-pink-200/20 animate-gradient-x" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute text-2xl text-pink-200/50 animate-glow",
              i % 2 === 0 ? "animate-float-slow" : "animate-float"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <Heart className="w-8 h-8" />
          </div>
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl text-purple-200/50 animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Sparkle className="w-6 h-6" />
          </div>
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xl text-white/50 animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            <Stars className="w-6 h-6" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl relative z-10">
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl font-semibold text-gray-800">Hi Tianna!</h1>
          <p className="text-gray-600">Welcome to your special assistant 💕</p>
          <p className="text-gray-600 text-sm">Please type the password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                "pr-10 transition-all duration-300",
                isFocused && "ring-2 ring-pink-300",
                isError && "animate-shake"
              )}
              placeholder="••••••••"
              aria-label="Password input"
            />
            <div className="absolute inset-0 pointer-events-none">
              {isFocused && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 to-purple-100/20 animate-ripple rounded-md" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white",
              "transform transition-transform duration-200 hover:scale-[1.02] active:scale-95",
              "relative overflow-hidden group"
            )}
          >
            {/* Sparkle trail effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-10 top-1/2 w-20 h-20 bg-white/20 rounded-full animate-sparkle-trail group-hover:animate-sparkle-trail-active" />
            </div>

            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              "Enter"
            )}
          </Button>
        </form>
      </div>

      {/* Success animation */}
      {validatePassword(password) && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="animate-heartburst">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-pink-400 rounded-full"
                style={{
                  transform: `rotate(${(360 / 12) * i}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-pink-200/20 to-purple-200/20 animate-fade-in" />
        </div>
      )}
    </div>
  );
};

export default PasswordScreen;
