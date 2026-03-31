import type { DraftShortQuestion, QuestionValidationErrors } from "../../types/quiz";

type Props = {
  question: DraftShortQuestion;
  errors?: QuestionValidationErrors;
  onChange: (updated: DraftShortQuestion) => void;
};

export default function ShortAnswerEditor({ question, errors, onChange }: Props) {
  return (
    <div className="question-editor">
      <label className="field-label">
        Prompt
        <textarea
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
          placeholder="Enter question prompt..."
          rows={2}
        />
        {errors?.prompt && <span className="field-error">{errors.prompt}</span>}
      </label>

      <label className="field-label">
        Correct Answer
        <input
          type="text"
          value={question.correctAnswer}
          onChange={(e) =>
            onChange({ ...question, correctAnswer: e.target.value })
          }
          placeholder="Expected answer (case-insensitive)"
        />
        {errors?.correctAnswer && (
          <span className="field-error">{errors.correctAnswer}</span>
        )}
      </label>
    </div>
  );
}