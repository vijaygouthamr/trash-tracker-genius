import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, Trophy, Camera } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      navigate("/hunt");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNHYxMmgtNFYzNHpNNiAxNGMwLTIgMi00IDItNHMyIDIgMiA0djEySDZWMTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative">
        <div className="bg-card/95 backdrop-blur-sm rounded-[3rem] shadow-2xl p-8 max-w-sm border-4 border-primary/30">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary to-accent rounded-full p-6 shadow-lg">
              <Leaf className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-center mb-3 text-foreground">
            EcoHunt
          </h1>
          
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Turn trash into treasure! 🌍
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 bg-primary/10 p-4 rounded-2xl">
              <Camera className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm">Record your waste disposal</span>
            </div>
            <div className="flex items-center gap-3 bg-accent/10 p-4 rounded-2xl">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm">AI validates your actions</span>
            </div>
            <div className="flex items-center gap-3 bg-secondary/10 p-4 rounded-2xl">
              <Trophy className="w-6 h-6 text-secondary flex-shrink-0" />
              <span className="text-sm">Earn points & compete!</span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
