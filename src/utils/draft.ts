import type {
  DraftMcqQuestion,
  DraftShortQuestion,
  QuizDraft,
} from "../types/quiz";

export function createEmptyDraft(): QuizDraft {
  return {
    title: "",
    description: "",
    isPublished: true,
    questions: [],
  };
}

export function createMcqQuestion(): DraftMcqQuestion {
  return {
    id: crypto.randomUUID(),
    type: "mcq",
    prompt: "",
    options: ["", ""],
    correctAnswer: -1,
    syncStatus: "idle",
  };
}

export function createShortQuestion(): DraftShortQuestion {
  return {
    id: crypto.randomUUID(),
    type: "short",
    prompt: "",
    correctAnswer: "",
    syncStatus: "idle",
  };
}
