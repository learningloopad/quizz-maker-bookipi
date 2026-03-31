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
    <div className="question-nav">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="btn-secondary"
      >
        ← Previous
      </button>
      <span className="question-counter">
        {currentIndex + 1} / {totalQuestions}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalQuestions - 1}
        className="btn-secondary"
      >
        Next →
      </button>
    </div>
  );
}