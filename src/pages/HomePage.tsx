import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Welcome</h2>
      <p className="text-muted-foreground">
        Create a quiz or take one using a quiz ID.
      </p>

      <div className="flex gap-3">
        <Button render={<Link to="/builder" />}>Create Quiz</Button>
        <Button variant="outline" render={<Link to="/play" />}>
          Take Quiz
        </Button>
      </div>
    </section>
  );
}