import type {
  DraftShortQuestion,
  QuestionValidationErrors,
} from "../../types/quiz";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  question: DraftShortQuestion;
  errors?: QuestionValidationErrors;
  onChange: (updated: DraftShortQuestion) => void;
};

export default function ShortAnswerEditor({
  question,
  errors,
  onChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Prompt</Label>
        <Textarea
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
          placeholder="Enter question prompt..."
          rows={2}
        />
        {errors?.prompt && (
          <p className="text-sm text-destructive">{errors.prompt}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Correct Answer</Label>
        <Input
          value={question.correctAnswer}
          onChange={(e) =>
            onChange({ ...question, correctAnswer: e.target.value })
          }
          placeholder="Expected answer (case-insensitive)"
        />
        {errors?.correctAnswer && (
          <p className="text-sm text-destructive">{errors.correctAnswer}</p>
        )}
      </div>
    </div>
  );
}
