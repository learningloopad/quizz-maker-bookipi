import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BuilderPage from "./pages/BuilderPage";
import PlayPage from "./pages/PlayPage";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-card">
        <h1 className="text-lg font-semibold">Quiz Maker</h1>
        <nav className="flex gap-2">
          <Button variant="ghost" size="sm" render={<Link to="/" />}>
            Home
          </Button>
          <Button variant="ghost" size="sm" render={<Link to="/builder" />}>
            Builder
          </Button>
          <Button variant="ghost" size="sm" render={<Link to="/play" />}>
            Play
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/play" element={<PlayPage />} />
        </Routes>
      </main>
    </div>
  );
}