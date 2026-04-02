import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createQuiz, createQuestion } from "../api/quizzes";
import type { Quiz, QuizDraft, CreateQuestionInput } from "../types/quiz";

export function useCreateQuizWithQuestions() {
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const mutation = useMutation({
    mutationFn: async (draft: QuizDraft) => {
      setProgress({ current: 0, total: draft.questions.length + 1 });

      // Step 1: create quiz
      const quiz = await createQuiz({
        title: draft.title,
        description: draft.description,
        timeLimitSeconds: draft.timeLimitSeconds,
        isPublished: draft.isPublished,
      });

      setProgress({ current: 1, total: draft.questions.length + 1 });

      // Step 2: create questions sequentially
      for (let i = 0; i < draft.questions.length; i++) {
        const q = draft.questions[i];
        let input: CreateQuestionInput;

        if (q.type === "mcq") {
          input = {
            type: "mcq",
            prompt: q.prompt,
            options: q.options,
            correctAnswer: String(q.correctAnswer),
            position: i,
          };
        } else {
          input = {
            type: "short",
            prompt: q.prompt,
            correctAnswer: q.correctAnswer,
            position: i,
          };
        }

        await createQuestion(quiz.id, input);
        setProgress({ current: i + 2, total: draft.questions.length + 1 });
      }

      return quiz;
    },
    onSettled: () => {
      // Reset progress when mutation finishes (success or error)
      setProgress({ current: 0, total: 0 });
    },
  });

  function save(draft: QuizDraft) {
    return mutation.mutateAsync(draft);
  }

  function reset() {
    mutation.reset();
    setProgress({ current: 0, total: 0 });
  }

  return {
    status: mutation.status,
    quiz: mutation.data as Quiz | undefined,
    error: mutation.error?.message ?? null,
    progress,
    save,
    reset,
  };
}
