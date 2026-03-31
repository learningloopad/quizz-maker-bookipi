import type { SubmitAttemptResponse } from "../../types/quiz";

type QuestionInfo = {
  id: number;
  prompt: string;
  type: string;
  options?: string[];
};

type Props = {
  result: SubmitAttemptResponse;
  questions: QuestionInfo[];
  answers: Record<number, string>;
  antiCheatSummary?: {
    blurCount: number;
    focusCount: number;
    pasteCount: number;
    total: number;
  };
  onPlayAgain: () => void;
};

export default function ResultsSummary({
  result,
  questions,
  answers,
  antiCheatSummary,
  onPlayAgain,
}: Props) {
  const totalQuestions = result.details.length;
  const correctCount = result.details.filter((d) => d.correct).length;

  return (
    <div className="results-summary">
      <h2>Results</h2>

      <div className="score-box">
        <span className="score-value">
          {correctCount} / {totalQuestions}
        </span>
        <span className="score-label">correct</span>
      </div>

      {antiCheatSummary && antiCheatSummary.total > 0 && (
        <div className="anticheat-box">
          <strong>Anti-Cheat Summary</strong>
          <ul>
            {antiCheatSummary.blurCount > 0 && (
              <li>{antiCheatSummary.blurCount} tab switch(es)</li>
            )}
            {antiCheatSummary.focusCount > 0 && (
              <li>{antiCheatSummary.focusCount} tab return(s)</li>
            )}
            {antiCheatSummary.pasteCount > 0 && (
              <li>{antiCheatSummary.pasteCount} paste(s)</li>
            )}
          </ul>
        </div>
      )}

      <div className="results-details">
        <h3>Per-Question Breakdown</h3>
        {result.details.map((detail) => {
          const question = questions.find((q) => q.id === detail.questionId);
          const userAnswer = answers[detail.questionId] ?? "(no answer)";
          const displayAnswer =
            question?.type === "mcq" && question.options
              ? question.options[Number(userAnswer)] ?? userAnswer
              : userAnswer;

          return (
            <div
              key={detail.questionId}
              className={`result-card ${detail.correct ? "result-correct" : "result-incorrect"}`}
            >
              <div className="result-card-header">
                <span className={`result-badge ${detail.correct ? "badge-correct" : "badge-incorrect"}`}>
                  {detail.correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </div>
              <p className="result-prompt">{question?.prompt ?? "Unknown question"}</p>
              <p className="result-answer">
                Your answer: <strong>{displayAnswer}</strong>
              </p>
              {!detail.correct && detail.expected && (
                <p className="result-expected">
                  Expected: <strong>{detail.expected}</strong>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="button-row">
        <button onClick={onPlayAgain} className="btn-primary">
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}