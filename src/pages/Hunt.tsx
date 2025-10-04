import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Video, Trophy, LogOut, User } from "lucide-react";
import { toast } from "sonner";

const Hunt = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [username, setUsername] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    startCamera();
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
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, points")
      .eq("user_id", user.id)
      .single();
    
    if (profile) {
      setUsername(profile.username || "Hunter");
      setUserPoints(profile.points || 0);
    }
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

  const startRecording = () => {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(fileName, videoBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("submissions")
        .getPublicUrl(fileName);

      const { data, error } = await supabase.functions.invoke("validate-waste", {
        body: { videoUrl: publicUrl, userId: user.id },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`🎉 +${data.points} points! ${data.feedback}`);
        setUserPoints(prev => prev + data.points);
      } else {
        toast.error(data.feedback);
      }
    } catch (error: any) {
      toast.error("Validation failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-card rounded-3xl shadow-xl p-6 border-4 border-primary/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold">{username}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-lg">{userPoints}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] mb-4">
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

          <div className="flex gap-3">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className="flex-1 rounded-xl h-14 text-lg font-semibold"
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
                  Start Recording
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="secondary"
              className="rounded-xl h-14 px-6"
            >
              <Trophy className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hunt;
