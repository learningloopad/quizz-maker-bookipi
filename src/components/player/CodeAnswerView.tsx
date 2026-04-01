import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
};

export default function CodeAnswerView({ value, onChange, onPaste }: Props) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
      placeholder="// Write your code here..."
      rows={10}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      className="min-h-[12rem] resize-y bg-gray-100 font-mono text-sm text-gray-800 placeholder:text-gray-400 dark:bg-gray-800 dark:text-gray-200"
    />
  );
}
