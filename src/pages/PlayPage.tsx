import { useState } from "react";
import { useAttemptSession } from "../hooks/useAttemptSession";
import { useAntiCheat } from "../hooks/useAntiCheat";
import McqAnswerView from "../components/player/McqAnswerView";
import ShortAnswerView from "../components/player/ShortAnswerView";
import CodeAnswerView from "../components/player/CodeAnswerView";
import QuestionNav from "../components/player/QuestionNav";
import ResultsSummary from "../components/player/ResultsSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function PlayPage() {
  const [quizIdInput, setQuizIdInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { session, start, setAnswer, submit, retry, reset } =
    useAttemptSession();
  const antiCheat = useAntiCheat(session.phase === "active");

  function handleStart() {
    const id = Number(quizIdInput.trim());
    if (!id || id <= 0) return;
    setCurrentIndex(0);
    start(id);
  }

  function handleSubmit() {
    submit(antiCheat.events);
  }

  function handlePlayAgain() {
    setQuizIdInput("");
    setCurrentIndex(0);
    reset();
    antiCheat.reset();
  }

  // Phase: idle — enter quiz ID
  if (session.phase === "idle") {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Take a Quiz</h2>
        <div className="space-y-2">
          <Label htmlFor="quiz-id">Quiz ID</Label>
          <Input
            id="quiz-id"
            value={quizIdInput}
            onChange={(e) => setQuizIdInput(e.target.value)}
            placeholder="Enter quiz ID..."
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
          />
          <Button onClick={handleStart}>Start Quiz</Button>
        </div>
      </section>
    );
  }

  // Phase: loading
  if (session.phase === "loading") {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading quiz...</h2>
        <Alert>
          <AlertDescription>Starting attempt...</AlertDescription>
        </Alert>
      </section>
    );
  }

  // Phase: error
  if (session.phase === "error") {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Error</h2>
        <Alert variant="destructive">
          <AlertDescription>{session.error}</AlertDescription>
        </Alert>
        {session.failedAnswers > 0 ? (
          <Button onClick={retry}>Retry Failed ({session.failedAnswers})</Button>
        ) : (
          <Button onClick={handlePlayAgain}>Try Again</Button>
        )}
      </section>
    );
  }

  // Phase: submitting / grading
  if (session.phase === "submitting" || session.phase === "grading") {
    const progressPercent =
      session.totalAnswers > 0
        ? (session.savedAnswers / session.totalAnswers) * 100
        : 0;

    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Submitting...</h2>
        {session.phase === "submitting" && session.totalAnswers > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Submitting answers… ({session.savedAnswers}/{session.totalAnswers})
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>
        )}
        {session.phase === "grading" && (
          <Alert>
            <AlertDescription>Grading your answers...</AlertDescription>
          </Alert>
        )}
      </section>
    );
  }

  // Phase: results
  if (session.phase === "results" && session.result && session.attempt) {
    return (
      <section>
        <ResultsSummary
          result={session.result}
          questions={session.attempt.quiz.questions}
          answers={session.answers}
          antiCheatSummary={antiCheat.getSummary()}
          onPlayAgain={handlePlayAgain}
        />
      </section>
    );
  }

  // Phase: active — answer questions
  if (session.phase === "active" && session.attempt) {
    const questions = session.attempt.quiz.questions;
    const question = questions[currentIndex];

    if (!question) {
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Error</h2>
          <Alert variant="destructive">
            <AlertDescription>
              No questions found in this quiz.
            </AlertDescription>
          </Alert>
          <Button onClick={handlePlayAgain}>Try Again</Button>
        </section>
      );
    }

    const currentAnswer = session.answers[question.id];
    const answeredCount = Object.keys(session.answers).length;
    const allAnswered = answeredCount === questions.length;

    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">
            {session.attempt.quiz.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {session.attempt.quiz.description}
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <p className="font-medium">{question.prompt}</p>

            {question.type === "mcq" &&
            "options" in question &&
            question.options ? (
              <McqAnswerView
                questionId={question.id}
                options={question.options}
                selectedIndex={
                  currentAnswer !== undefined ? Number(currentAnswer) : null
                }
                onSelect={(index) => setAnswer(question.id, String(index))}
              />
            ) : question.type === "code" ? (
              <CodeAnswerView
                value={currentAnswer ?? ""}
                onChange={(value) => setAnswer(question.id, value)}
                onPaste={() => antiCheat.logPaste(question.id)}
              />
            ) : (
              <ShortAnswerView
                value={currentAnswer ?? ""}
                onChange={(value) => setAnswer(question.id, value)}
                onPaste={() => antiCheat.logPaste(question.id)}
              />
            )}
          </CardContent>
        </Card>

        <QuestionNav
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
        />

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            {answeredCount} / {questions.length} answered
          </span>
          <Button onClick={handleSubmit} disabled={!allAnswered}>
            Submit Quiz
          </Button>
        </div>
      </section>
    );
  }

  return null;
}
