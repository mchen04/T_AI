import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordScreenProps {
  onSuccess: () => void;
}

const PasswordScreen = ({ onSuccess }: PasswordScreenProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!import.meta.env.VITE_WEB_APP_PASSWORD) {
      toast({
        title: "Configuration Error",
        description: "Password not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (password === import.meta.env.VITE_WEB_APP_PASSWORD) {
      toast({
        title: "Authentication Successful",
        description: "Welcome!",
      });
      onSuccess();
    } else {
      toast({
        title: "Incorrect Password",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-romantic-peach via-romantic-pink to-romantic-purple">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-800">Welcome to TiannaGPT</h1>
          <p className="text-gray-600">Please enter your password to continue 💕</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button type="submit" className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white">
            Enter
          </Button>
        </form>
      </div>
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            <span className="text-3xl">💕</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordScreen;
