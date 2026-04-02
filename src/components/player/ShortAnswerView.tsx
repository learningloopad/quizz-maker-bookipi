import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
};

export default function ShortAnswerView({ value, onChange, onPaste }: Props) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
      placeholder="Type your answer..."
    />
  );
}
