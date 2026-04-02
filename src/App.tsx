import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BuilderPage from "./pages/BuilderPage";
import PlayPage from "./pages/PlayPage";
import { Button } from "@/components/ui/button";

export default function App() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-secondary text-foreground"
      : "text-muted-foreground hover:text-foreground";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Take-home Project
            </p>
            <h1 className="text-xl font-semibold">Quiz Maker</h1>
          </div>
          <nav className="flex gap-2 rounded-lg border bg-card p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              render={<NavLink to="/" className={navLinkClass} />}
            >
            Home
          </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              render={<NavLink to="/builder" className={navLinkClass} />}
            >
            Builder
          </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              render={<NavLink to="/play" className={navLinkClass} />}
            >
            Play
          </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/play" element={<PlayPage />} />
        </Routes>
      </main>
    </div>
  );
}
