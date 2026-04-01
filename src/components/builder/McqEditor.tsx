import type { DraftMcqQuestion, QuestionValidationErrors } from "../../types/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Prompt</Label>
        <Textarea
          value={question.prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          placeholder="Enter question prompt..."
          rows={2}
        />
        {errors?.prompt && (
          <p className="text-sm text-destructive">{errors.prompt}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Options (select correct answer)</Label>
        <RadioGroup
          value={question.correctAnswer >= 0 ? String(question.correctAnswer) : ""}
          onValueChange={(val) => selectCorrectAnswer(Number(val))}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <RadioGroupItem value={String(index)} />
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              {question.options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeOption(index)}
                  title="Remove option"
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </RadioGroup>
        {errors?.options && (
          <p className="text-sm text-destructive">{errors.options}</p>
        )}
        {errors?.correctAnswer && (
          <p className="text-sm text-destructive">{errors.correctAnswer}</p>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={addOption}>
          + Add option
        </Button>
      </div>
    </div>
  );
}