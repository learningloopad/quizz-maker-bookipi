import { useState } from "react";
import type { DraftQuestion, QuizDraft, QuizDraftValidationErrors } from "../types/quiz";
import { createEmptyDraft, createMcqQuestion, createShortQuestion } from "../utils/draft";
import { hasErrors, validateQuizDraft } from "../utils/validation";
import { useCreateQuizWithQuestions } from "../hooks/useCreateQuizWithQuestions";
import QuestionCard from "../components/builder/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BuilderPage() {
  const [draft, setDraft] = useState<QuizDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<QuizDraftValidationErrors | null>(null);
  const { status, quiz, error, progress, save, reset } =
    useCreateQuizWithQuestions();

  function updateField(field: keyof QuizDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors) {
      setErrors((prev) => (prev ? { ...prev, [field]: undefined } : null));
    }
  }

  function addQuestion(type: "mcq" | "short") {
    const question = type === "mcq" ? createMcqQuestion() : createShortQuestion();
    setDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  }

  function updateQuestion(id: string, updated: DraftQuestion) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? updated : q)),
    }));
  }

  function removeQuestion(id: string) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }

  async function handleSave() {
    const validation = validateQuizDraft(draft);
    setErrors(validation);

    if (hasErrors(validation)) {
      return;
    }

    await save(draft);
  }

  function handleReset() {
    setDraft(createEmptyDraft());
    setErrors(null);
    reset();
  }

  // Success state
  if (status === "success" && quiz) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quiz Created!</h2>
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your quiz <strong>"{quiz.title}"</strong> was saved.
            <br />
            Quiz ID: <code className="rounded bg-muted px-1.5 py-0.5 text-lg font-semibold">{quiz.id}</code>
            <br />
            Share this ID with anyone who should take the quiz.
          </AlertDescription>
        </Alert>
        <Button onClick={handleReset}>Create Another</Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Quiz Builder</h2>

      {/* Quiz metadata */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="quiz-title">Title</Label>
          <Input
            id="quiz-title"
            value={draft.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. JavaScript Basics"
          />
          {errors?.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="quiz-description">Description</Label>
          <Textarea
            id="quiz-description"
            value={draft.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="What is this quiz about?"
            rows={3}
          />
          {errors?.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Questions</h3>
        {errors?.questions && (
          <p className="text-sm text-destructive">{errors.questions}</p>
        )}

        {draft.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            errors={errors?.questionErrors[question.id]}
            onChange={(updated) => updateQuestion(question.id, updated)}
            onRemove={() => removeQuestion(question.id)}
          />
        ))}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addQuestion("mcq")}
          >
            + Multiple Choice
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addQuestion("short")}
          >
            + Short Answer
          </Button>
        </div>
      </div>

      {/* Save */}
      <div className="space-y-3">
        {status === "error" && error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "pending" && (
          <Alert>
            <AlertDescription>
              Saving... ({progress.current} / {progress.total})
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSave} disabled={status === "pending"}>
          {status === "pending" ? "Saving..." : "Save Quiz"}
        </Button>
      </div>
    </section>
  );
}