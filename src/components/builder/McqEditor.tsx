import type { DraftMcqQuestion, QuestionValidationErrors } from "../../types/quiz";

type Props = {
  question: DraftMcqQuestion;
  errors?: QuestionValidationErrors;
  onChange: (updated: DraftMcqQuestion) => void;
};

export default function McqEditor({ question, errors, onChange }: Props) {
  function updatePrompt(prompt: string) {
    onChange({ ...question, prompt });
  }

  function updateOption(index: number, value: string) {
    const options = [...question.options];
    options[index] = value;
    onChange({ ...question, options });
  }

  function addOption() {
    onChange({ ...question, options: [...question.options, ""] });
  }

  function removeOption(index: number) {
    const options = question.options.filter((_, i) => i !== index);
    const correctAnswer =
      question.correctAnswer === index
        ? -1
        : question.correctAnswer > index
          ? question.correctAnswer - 1
          : question.correctAnswer;
    onChange({ ...question, options, correctAnswer });
  }

  function selectCorrectAnswer(index: number) {
    onChange({ ...question, correctAnswer: index });
  }

  return (
    <div className="question-editor">
      <label className="field-label">
        Prompt
        <textarea
          value={question.prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          placeholder="Enter question prompt..."
          rows={2}
        />
        {errors?.prompt && <span className="field-error">{errors.prompt}</span>}
      </label>

      <div className="options-section">
        <span className="field-label">Options (select correct answer)</span>
        {question.options.map((option, index) => (
          <div key={index} className="option-row">
            <input
              type="radio"
              name={`correct-${question.id}`}
              checked={question.correctAnswer === index}
              onChange={() => selectCorrectAnswer(index)}
            />
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="btn-icon"
                title="Remove option"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {errors?.options && (
          <span className="field-error">{errors.options}</span>
        )}
        {errors?.correctAnswer && (
          <span className="field-error">{errors.correctAnswer}</span>
        )}
        <button type="button" onClick={addOption} className="btn-small">
          + Add option
        </button>
      </div>
    </div>
  );
}