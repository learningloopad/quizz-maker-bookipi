import type {
  DraftQuestion,
  QuestionSyncStatus,
  QuestionValidationErrors,
} from "../../types/quiz";
import McqEditor from "./McqEditor";
import ShortAnswerEditor from "./ShortAnswerEditor";
import { Badge } from "@/components/ui/badge";
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
  syncStatus?: QuestionSyncStatus;
  syncError?: string;
  disabled?: boolean;
  onChange: (updated: DraftQuestion) => void;
  onRemove: () => void;
};

const syncBadgeConfig: Record<
  Exclude<QuestionSyncStatus, "idle">,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  saving: { label: "Saving…", variant: "outline" },
  saved: { label: "Saved", variant: "default" },
  failed: { label: "Failed", variant: "destructive" },
};

export default function QuestionCard({
  index,
  question,
  errors,
  syncStatus,
  syncError,
  disabled,
  onChange,
  onRemove,
}: Props) {
  const typeLabel =
    question.type === "mcq" ? "Multiple Choice" : "Short Answer";
  const badgeInfo = syncStatus && syncStatus !== "idle" ? syncBadgeConfig[syncStatus] : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <strong className="text-sm">
            Question {index + 1} — {typeLabel}
          </strong>
          {badgeInfo && (
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          )}
        </div>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {syncError && (
          <p className="mb-2 text-sm text-destructive">{syncError}</p>
        )}
        {question.type === "mcq" ? (
          <McqEditor
            question={question}
            errors={errors}
            onChange={(updated) => onChange(updated)}
            disabled={disabled}
          />
        ) : (
          <ShortAnswerEditor
            question={question}
            errors={errors}
            onChange={(updated) => onChange(updated)}
            disabled={disabled}
          />
        )}
      </CardContent>
    </Card>
  );
}
