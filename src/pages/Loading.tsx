import PhoneMockup from "@/components/PhoneMockup";
import { Leaf } from "lucide-react";

const Loading = () => {
  return (
    <PhoneMockup>
      <div className="h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-primary rounded-full p-8 shadow-2xl animate-bounce">
              <Leaf className="w-20 h-20 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">EcoHunt</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

export default Loading;
