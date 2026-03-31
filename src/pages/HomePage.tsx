import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section>
      <h2>Welcome</h2>
      <p>Create a quiz or take one using a quiz ID.</p>

      <div style={{ display: "flex", gap: "12px" }}>
        <Link to="/builder">Create Quiz</Link>
        <Link to="/play">Take Quiz</Link>
      </div>
    </section>
  );
}