import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <RadioGroup
      value={selectedIndex !== null ? String(selectedIndex) : ""}
      onValueChange={(val) => onSelect(Number(val))}
    >
      {options.map((option, index) => (
        <label
          key={index}
          htmlFor={`q${questionId}-opt${index}`}
          className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 has-data-[checked]:border-primary has-data-[checked]:bg-primary/5"
        >
          <RadioGroupItem
            value={String(index)}
            id={`q${questionId}-opt${index}`}
          />
          <span className="font-normal">{option}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
