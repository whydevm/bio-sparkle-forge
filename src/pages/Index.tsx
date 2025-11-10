import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-primary text-3xl">🔫</div>
            <span className="text-2xl font-bold">
              soul<span className="text-primary">.</span>gg
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-20 px-6">
          <div className="space-y-4">
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start text-lg">
                Sign In
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>
              <Button className="w-full text-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero section */}
      <main className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Everything you want, right here.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            soul.gg is your go-to for modern, feature-rich biolinks and fast, secure file hosting. Everything you need — right here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                Sign Up for Free
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
              View Pricing
            </Button>
          </div>

          {/* Preview mockups */}
          <div className="pt-16 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="glass-panel h-64 rounded-2xl p-4 transform md:translate-y-8">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl" />
              </div>
              <div className="glass-panel h-80 rounded-2xl p-4">
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl" />
              </div>
              <div className="glass-panel h-64 rounded-2xl p-4 transform md:translate-y-8">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
