import { useState } from "react";
import type { DraftQuestion, QuizDraft, QuizDraftValidationErrors } from "../types/quiz";
import { createEmptyDraft, createMcqQuestion, createShortQuestion } from "../utils/draft";
import { hasErrors, validateQuizDraft } from "../utils/validation";
import { useCreateQuizWithQuestions } from "../hooks/useCreateQuizWithQuestions";
import QuestionCard from "../components/builder/QuestionCard";

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
      <section>
        <h2>Quiz Created!</h2>
        <div className="success-box">
          <p>
            Your quiz <strong>"{quiz.title}"</strong> was saved.
          </p>
          <p>
            Quiz ID: <code className="quiz-id">{quiz.id}</code>
          </p>
          <p>Share this ID with anyone who should take the quiz.</p>
        </div>
        <div className="button-row">
          <button onClick={handleReset} className="btn-primary">
            Create Another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Quiz Builder</h2>

      {/* Quiz metadata */}
      <div className="form-section">
        <label className="field-label">
          Title
          <input
            type="text"
            value={draft.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. JavaScript Basics"
          />
          {errors?.title && <span className="field-error">{errors.title}</span>}
        </label>

        <label className="field-label">
          Description
          <textarea
            value={draft.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="What is this quiz about?"
            rows={3}
          />
          {errors?.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </label>
      </div>

      {/* Questions */}
      <div className="form-section">
        <h3>Questions</h3>
        {errors?.questions && (
          <div className="field-error">{errors.questions}</div>
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

        <div className="button-row">
          <button
            type="button"
            onClick={() => addQuestion("mcq")}
            className="btn-secondary"
          >
            + Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => addQuestion("short")}
            className="btn-secondary"
          >
            + Short Answer
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="form-section">
        {status === "error" && error && (
          <div className="error-box">{error}</div>
        )}

        {status === "pending" && (
          <div className="progress-box">
            Saving... ({progress.current} / {progress.total})
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={status === "pending"}
          className="btn-primary"
        >
          {status === "pending" ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </section>
  );
}