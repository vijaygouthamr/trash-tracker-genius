import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Loading from "./Loading";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Simulate loading for better UX
    setTimeout(() => {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return <Loading />;
  }

  return null;
};

export default Index;
