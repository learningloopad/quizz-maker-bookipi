type Props = {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
};

export default function ShortAnswerView({ value, onChange, onPaste }: Props) {
  return (
    <div className="short-answer-view">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
        placeholder="Type your answer..."
      />
    </div>
  );
}