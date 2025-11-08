import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/20">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <h1 className="text-6xl font-bold glow-text">
          haunt.gg
        </h1>
        <p className="text-xl text-muted-foreground">
          Create your own customizable bio link with stunning effects and features
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
