import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Video, LogOut } from "lucide-react";
import { toast } from "sonner";
import PhoneMockup from "@/components/PhoneMockup";
import earthGlobe from "@/assets/earth-globe.png";

const Hunt = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [username, setUsername] = useState("");
  const [leaderboard, setLeaderboard] = useState<Array<{ username: string; points: number }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    return () => {
      stopCamera();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setUsername(user.email?.split('@')[0] || "Hunter");
    
    // Mock data until migration is approved
    setUserPoints(20);
    setLeaderboard([
      { username: "user1", points: 35 },
      { username: "user2", points: 28 },
      { username: "user3", points: 20 }
    ]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: true 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    if (!mediaStream) {
      await startCamera();
    }
    
    if (!mediaStream) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      await uploadAndValidate(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
    toast.success("Recording started!");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing video...");
    }
  };

  const uploadAndValidate = async (videoBlob: Blob) => {
    try {
      toast.success("🎉 +10 points! Great job disposing that waste correctly!");
      setUserPoints(prev => prev + 10);
    } catch (error: any) {
      toast.error("Validation failed");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <PhoneMockup>
      <div className="h-full bg-background p-6 pt-12 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Hello {username}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shadow-lg"
          >
            <LogOut className="w-6 h-6 text-secondary-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Earth and Items Found Section */}
          <div className="flex gap-4 items-center">
            {/* Earth Globe */}
            <div className="w-40 h-40 flex-shrink-0">
              <img 
                src={earthGlobe} 
                alt="Earth" 
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </div>

            {/* Items Found Card */}
            <div className="flex-1 bg-primary rounded-3xl p-6 shadow-lg">
              <p className="text-primary-foreground/80 text-lg font-medium mb-2">
                Items Found:
              </p>
              <p className="text-6xl font-bold text-primary-foreground">
                {userPoints}
              </p>
            </div>
          </div>

          {/* Camera Recording Section */}
          {mediaStream && (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-destructive-foreground rounded-full" />
                  REC
                </div>
              )}
            </div>
          )}

          {/* Camera Controls */}
          <div className="flex gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className="flex-1 rounded-2xl h-14 text-lg font-semibold shadow-lg"
              variant={isRecording ? "destructive" : "default"}
            >
              {isRecording ? (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-primary rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-primary-foreground mb-4">
              Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 pb-3 border-b border-primary-foreground/20 last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
                  <span className="text-lg text-primary-foreground/90 font-medium">
                    {entry.username}
                  </span>
                  <span className="ml-auto text-lg font-bold text-primary-foreground">
                    {entry.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

export default Hunt;
