type Props = {
  questionId: number;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

export default function McqAnswerView({
  questionId,
  options,
  selectedIndex,
  onSelect,
}: Props) {
  return (
    <div className="mcq-answer-view">
      {options.map((option, index) => (
        <label key={index} className="mcq-option">
          <input
            type="radio"
            name={`answer-${questionId}`}
            checked={selectedIndex === index}
            onChange={() => onSelect(index)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}