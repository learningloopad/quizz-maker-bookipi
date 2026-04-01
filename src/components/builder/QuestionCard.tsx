import type { DraftQuestion, QuestionValidationErrors } from "../../types/quiz";
import McqEditor from "./McqEditor";
import ShortAnswerEditor from "./ShortAnswerEditor";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <strong className="text-sm">
          Question {index + 1} — {typeLabel}
        </strong>
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}