import { Button } from "@/components/ui/button";

type Props = {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function QuestionNav({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        ← Previous
      </Button>
      <span className="text-sm text-muted-foreground font-medium">
        {currentIndex + 1} / {totalQuestions}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
      >
        Next →
      </Button>
    </div>
  );
}