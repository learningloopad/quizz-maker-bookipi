import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BuilderPage from "./pages/BuilderPage";
import PlayPage from "./pages/PlayPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Quiz Maker</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/builder">Builder</Link>
          <Link to="/play">Play</Link>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>
    </div>
  );
}