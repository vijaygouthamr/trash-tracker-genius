import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Leaf } from "lucide-react";
import PhoneMockup from "@/components/PhoneMockup";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username },
          },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneMockup>
      <div className="h-full bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-card rounded-3xl shadow-xl p-8 border-2 border-primary/20">
            <div className="flex justify-center mb-6">
              <div className="bg-primary rounded-full p-4">
                <Leaf className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
              EcoHunt
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              {isLogin ? "Welcome back!" : "Join the mission!"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-2xl border-2 h-12"
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl border-2 h-12"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl border-2 h-12"
              />
              
              <Button 
                type="submit" 
                className="w-full rounded-2xl h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

export default Login;
