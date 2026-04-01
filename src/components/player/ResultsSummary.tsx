import type { SubmitAttemptResponse } from "../../types/quiz";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type QuestionInfo = {
  id: number;
  prompt: string;
  type: string;
  options?: string[];
};

type Props = {
  result: SubmitAttemptResponse;
  questions: QuestionInfo[];
  answers: Record<number, string>;
  antiCheatSummary?: {
    blurCount: number;
    focusCount: number;
    pasteCount: number;
    total: number;
  };
  onPlayAgain: () => void;
};

export default function ResultsSummary({
  result,
  questions,
  answers,
  antiCheatSummary,
  onPlayAgain,
}: Props) {
  const isCodeQuestion = (id: number) =>
    questions.find((q) => q.id === id)?.type === "code";
  const gradedDetails = result.details.filter((d) => !isCodeQuestion(d.questionId));
  const pendingDetails = result.details.filter((d) => isCodeQuestion(d.questionId));
  const totalQuestions = gradedDetails.length;
  const correctCount = gradedDetails.filter((d) => d.correct).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Results</h2>

      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">
          {correctCount} / {totalQuestions}
        </span>
        <span className="text-muted-foreground">correct</span>
        {pendingDetails.length > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            ({pendingDetails.length} pending manual review)
          </span>
        )}
      </div>

      {antiCheatSummary && antiCheatSummary.total > 0 && (
        <Alert>
          <AlertTitle>Anti-Cheat Summary</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {antiCheatSummary.blurCount > 0 && (
                <li>{antiCheatSummary.blurCount} tab switch(es)</li>
              )}
              {antiCheatSummary.focusCount > 0 && (
                <li>{antiCheatSummary.focusCount} tab return(s)</li>
              )}
              {antiCheatSummary.pasteCount > 0 && (
                <li>{antiCheatSummary.pasteCount} paste(s)</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Per-Question Breakdown</h3>
        {result.details.map((detail) => {
          const question = questions.find((q) => q.id === detail.questionId);
          const isCode = question?.type === "code";
          const userAnswer = answers[detail.questionId] ?? "(no answer)";
          const displayAnswer =
            question?.type === "mcq" && question.options
              ? question.options[Number(userAnswer)] ?? userAnswer
              : userAnswer;

          if (isCode) {
            return (
              <Card key={detail.questionId} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="space-y-1.5">
                  <Badge variant="outline" className="text-yellow-700 border-yellow-400">
                    Pending Review
                  </Badge>
                  <p className="font-medium">
                    {question?.prompt ?? "Unknown question"}
                  </p>
                  <Textarea
                    value={userAnswer}
                    readOnly
                    rows={6}
                    className="resize-none cursor-default bg-gray-100 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  />
                  <p className="text-xs text-muted-foreground">
                    Code questions require manual grading.
                  </p>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={detail.questionId}
              className={
                detail.correct
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }
            >
              <CardContent className="space-y-1.5">
                <Badge variant={detail.correct ? "secondary" : "destructive"}>
                  {detail.correct ? "Correct" : "Incorrect"}
                </Badge>
                <p className="font-medium">
                  {question?.prompt ?? "Unknown question"}
                </p>
                <p className="text-sm">
                  Your answer: <strong>{displayAnswer}</strong>
                </p>
                {!detail.correct && detail.expected && (
                  <p className="text-sm text-muted-foreground">
                    Expected: <strong>{detail.expected}</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button onClick={onPlayAgain}>Take Another Quiz</Button>
    </div>
  );
}