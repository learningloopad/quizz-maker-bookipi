import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <Card className="border-none bg-gradient-to-r from-card to-muted/50 ring-1 ring-border">
        <CardHeader>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Quick Start
          </p>
          <CardTitle className="text-3xl">Build and run quizzes in minutes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-2xl text-muted-foreground">
            Use Builder to create a quiz, then share the generated ID so someone can take it in Play mode.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link to="/builder" />}>Create Quiz</Button>
            <Button variant="outline" render={<Link to="/play" />}>
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">For quiz creators</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Add MCQ and short-answer questions, save with progress tracking, and retry any failed question saves.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">For quiz takers</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Join with quiz ID, navigate question-by-question, and submit with resilient answer syncing and retry.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
