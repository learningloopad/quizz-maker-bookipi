import type { DraftQuestion, QuestionValidationErrors } from "../../types/quiz";
import McqEditor from "./McqEditor";
import ShortAnswerEditor from "./ShortAnswerEditor";

type Props = {
  index: number;
  question: DraftQuestion;
  errors?: QuestionValidationErrors;
  onChange: (updated: DraftQuestion) => void;
  onRemove: () => void;
};

export default function QuestionCard({
  index,
  question,
  errors,
  onChange,
  onRemove,
}: Props) {
  const typeLabel = question.type === "mcq" ? "Multiple Choice" : "Short Answer";

  return (
    <div className="question-card">
      <div className="question-card-header">
        <strong>
          Question {index + 1} — {typeLabel}
        </strong>
        <button type="button" onClick={onRemove} className="btn-danger">
          Remove
        </button>
      </div>

      {question.type === "mcq" ? (
        <McqEditor
          question={question}
          errors={errors}
          onChange={(updated) => onChange(updated)}
        />
      ) : (
        <ShortAnswerEditor
          question={question}
          errors={errors}
          onChange={(updated) => onChange(updated)}
        />
      )}
    </div>
  );
}