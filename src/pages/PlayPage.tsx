import { useState } from "react";
import { useAttemptSession } from "../hooks/useAttemptSession";
import { useAntiCheat } from "../hooks/useAntiCheat";
import McqAnswerView from "../components/player/McqAnswerView";
import ShortAnswerView from "../components/player/ShortAnswerView";
import QuestionNav from "../components/player/QuestionNav";
import ResultsSummary from "../components/player/ResultsSummary";

export default function PlayPage() {
  const [quizIdInput, setQuizIdInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const { session, start, setAnswer, submit, reset } = useAttemptSession();
  const antiCheat = useAntiCheat(session.phase === "active");

  function handleStart() {
    const id = Number(quizIdInput.trim());
    if (!id || id <= 0) return;
    setCurrentIndex(0);
    start(id);
  }

  function handleSubmit() {
    submit(antiCheat.events);
  }

  function handlePlayAgain() {
    setQuizIdInput("");
    setCurrentIndex(0);
    reset();    antiCheat.reset()  }

  // Phase: idle — enter quiz ID
  if (session.phase === "idle") {
    return (
      <section>
        <h2>Take a Quiz</h2>
        <div className="form-section">
          <label className="field-label">
            Quiz ID
            <input
              type="text"
              value={quizIdInput}
              onChange={(e) => setQuizIdInput(e.target.value)}
              placeholder="Enter quiz ID..."
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
            />
          </label>
          <button onClick={handleStart} className="btn-primary">
            Start Quiz
          </button>
        </div>
      </section>
    );
  }

  // Phase: loading
  if (session.phase === "loading") {
    return (
      <section>
        <h2>Loading quiz...</h2>
        <div className="progress-box">Starting attempt...</div>
      </section>
    );
  }

  // Phase: error
  if (session.phase === "error") {
    return (
      <section>
        <h2>Error</h2>
        <div className="error-box">{session.error}</div>
        <button onClick={handlePlayAgain} className="btn-primary">
          Try Again
        </button>
      </section>
    );
  }

  // Phase: submitting
  if (session.phase === "submitting") {
    return (
      <section>
        <h2>Submitting...</h2>
        <div className="progress-box">Grading your answers...</div>
      </section>
    );
  }

  // Phase: results
  if (session.phase === "results" && session.result && session.attempt) {
    return (
      <section>
        <ResultsSummary
          result={session.result}
          questions={session.attempt.quiz.questions}
          answers={session.answers}
          antiCheatSummary={antiCheat.getSummary()}
          onPlayAgain={handlePlayAgain}
        />
      </section>
    );
  }

  // Phase: active — answer questions
  if (session.phase === "active" && session.attempt) {
    const questions = session.attempt.quiz.questions;
    const question = questions[currentIndex];

    if (!question) {
      return (
        <section>
          <h2>Error</h2>
          <div className="error-box">No questions found in this quiz.</div>
          <button onClick={handlePlayAgain} className="btn-primary">
            Try Again
          </button>
        </section>
      );
    }

    const currentAnswer = session.answers[question.id];
    const answeredCount = Object.keys(session.answers).length;
    const allAnswered = answeredCount === questions.length;

    return (
      <section>
        <div className="quiz-player-header">
          <h2>{session.attempt.quiz.title}</h2>
          <p className="quiz-player-description">
            {session.attempt.quiz.description}
          </p>
        </div>

        <div className="question-card">
          <p className="question-prompt">{question.prompt}</p>

          {question.type === "mcq" && "options" in question && question.options ? (
            <McqAnswerView
              questionId={question.id}
              options={question.options}
              selectedIndex={
                currentAnswer !== undefined ? Number(currentAnswer) : null
              }
              onSelect={(index) => setAnswer(question.id, String(index))}
            />
          ) : (
            <ShortAnswerView
              value={currentAnswer ?? ""}
              onChange={(value) => setAnswer(question.id, value)}
              onPaste={() => antiCheat.logPaste(question.id)}
            />
          )}
        </div>

        <QuestionNav
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() =>
            setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
          }
        />

        <div className="submit-section">
          <span className="answered-count">
            {answeredCount} / {questions.length} answered
          </span>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="btn-primary"
          >
            Submit Quiz
          </button>
        </div>
      </section>
    );
  }

  return null;
}