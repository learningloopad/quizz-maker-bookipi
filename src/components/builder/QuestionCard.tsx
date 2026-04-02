import type { DraftQuestion, QuestionValidationErrors } from "../../types/quiz";
import McqEditor from "./McqEditor";
import ShortAnswerEditor from "./ShortAnswerEditor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";

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
  const typeLabel =
    question.type === "mcq" ? "Multiple Choice" : "Short Answer";

  return (
    <Card>
      <CardHeader>
        <strong className="text-sm">
          Question {index + 1} — {typeLabel}
        </strong>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardAction>
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
