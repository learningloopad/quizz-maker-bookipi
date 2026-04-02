import { useState } from "react";
import type {
  DraftQuestion,
  QuizDraft,
  QuizDraftValidationErrors,
} from "../types/quiz";
import {
  createEmptyDraft,
  createMcqQuestion,
  createShortQuestion,
} from "../utils/draft";
import { hasErrors, validateQuizDraft } from "../utils/validation";
import { useSaveQuiz } from "../hooks/useSaveQuiz";
import QuestionCard from "../components/builder/QuestionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { MAX_QUESTION } from "@/lib/constants";

export default function BuilderPage() {
  const [draft, setDraft] = useState<QuizDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<QuizDraftValidationErrors | null>(null);
  const {
    phase,
    quiz,
    syncMap,
    globalError,
    isSaving,
    totalQuestions,
    savedCount,
    failedCount,
    save,
    retry,
    reset,
  } = useSaveQuiz();

  function updateField(field: keyof QuizDraft, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors) {
      setErrors((prev) => (prev ? { ...prev, [field]: undefined } : null));
    }
  }

  function addQuestion(type: "mcq" | "short") {
    const question =
      type === "mcq" ? createMcqQuestion() : createShortQuestion();
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

  async function handleRetry() {
    const failedQuestions = draft.questions.filter(
      (q) => syncMap[q.id]?.status === "failed",
    );
    await retry(failedQuestions);
  }

  function handleReset() {
    setDraft(createEmptyDraft());
    setErrors(null);
    reset();
  }

  // Success state
  if (phase === "done" && quiz) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quiz Created!</h2>
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your quiz <strong>"{quiz.title}"</strong> was saved.
            <br />
            Quiz ID:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-lg font-semibold">
              {quiz.id}
            </code>
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
            disabled={isSaving}
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
            disabled={isSaving}
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
            syncStatus={syncMap[question.id]?.status}
            syncError={syncMap[question.id]?.error}
            disabled={isSaving}
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
            disabled={isSaving || draft.questions.length >= MAX_QUESTION}
          >
            + Multiple Choice
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addQuestion("short")}
            disabled={isSaving || draft.questions.length >= MAX_QUESTION}
          >
            + Short Answer
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {draft.questions.length} / {MAX_QUESTION} questions
        </p>
      </div>

      {/* Save */}
      <div className="space-y-3">
        {globalError && (
          <Alert variant="destructive">
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {isSaving && totalQuestions > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {phase === "creating-quiz" && "Creating quiz…"}
                {phase === "saving-questions" &&
                  `Saving questions… (${savedCount}/${totalQuestions})`}
                {phase === "publishing" && "Publishing quiz…"}
              </span>
              <span>
                {Math.round((savedCount / totalQuestions) * 100)}%
              </span>
            </div>
            <Progress value={(savedCount / totalQuestions) * 100} />
          </div>
        )}

        {failedCount > 0 && phase === "error" ? (
          <Button onClick={handleRetry}>
            Retry Failed ({failedCount})
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save Quiz"}
          </Button>
        )}
      </div>
    </section>
  );
}
