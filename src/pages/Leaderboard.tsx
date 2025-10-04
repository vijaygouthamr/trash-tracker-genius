import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  points: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("username, points")
      .order("points", { ascending: false })
      .limit(10);

    if (data) {
      const leaderboard = data.map((entry, index) => ({
        ...entry,
        username: entry.username || "Anonymous",
        rank: index + 1,
      }));
      setLeaders(leaderboard);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-accent" />;
      case 2:
        return <Medal className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-card rounded-3xl shadow-xl p-6 border-4 border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/hunt")}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-accent" />
              Leaderboard
            </h1>
          </div>

          <div className="space-y-3">
            {leaders.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  entry.rank === 1
                    ? "bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/50"
                    : entry.rank === 2
                    ? "bg-gradient-to-r from-muted/50 to-muted/30 border-2 border-muted"
                    : entry.rank === 3
                    ? "bg-gradient-to-r from-orange-200/30 to-orange-100/20 border-2 border-orange-300/50"
                    : "bg-muted/20 border border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <span className="font-semibold text-lg">{entry.username}</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="font-bold">{entry.points}</span>
                </div>
              </div>
            ))}
          </div>

          {leaders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No entries yet. Be the first!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
