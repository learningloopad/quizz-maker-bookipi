import { useCallback, useReducer, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { createQuiz, createQuestion, publishQuiz } from "../api/quizzes";
import type {
  CreateQuestionInput,
  DraftQuestion,
  Quiz,
  QuizDraft,
  QuestionSyncStatus,
} from "../types/quiz";

type SavePhase =
  | "idle"
  | "creating-quiz"
  | "saving-questions"
  | "publishing"
  | "done"
  | "error";

type QuestionSyncMap = Record<
  string,
  { status: QuestionSyncStatus; error?: string }
>;

type SaveState = {
  phase: SavePhase;
  syncMap: QuestionSyncMap;
};

type BatchUpdate = Record<
  string,
  { status: "saved" | "failed"; error?: string }
>;

type SaveAction =
  | { type: "INIT_SAVE"; questions: DraftQuestion[] }
  | { type: "SET_PHASE"; phase: SavePhase }
  | { type: "SET_BATCH_SAVING"; ids: string[] }
  | { type: "SET_BATCH_RESULTS"; updates: BatchUpdate }
  | { type: "MARK_RETRY"; ids: string[] }
  | { type: "RESET" };

const initialSaveState: SaveState = { phase: "idle", syncMap: {} };

function saveReducer(state: SaveState, action: SaveAction): SaveState {
  switch (action.type) {
    case "INIT_SAVE": {
      const syncMap: QuestionSyncMap = {};
      for (const q of action.questions) {
        syncMap[q.id] = { status: "pending" };
      }
      return { phase: "creating-quiz", syncMap };
    }
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "SET_BATCH_SAVING": {
      const syncMap = { ...state.syncMap };
      for (const id of action.ids) {
        syncMap[id] = { status: "saving" };
      }
      return { ...state, syncMap };
    }
    case "SET_BATCH_RESULTS":
      return { ...state, syncMap: { ...state.syncMap, ...action.updates } };
    case "MARK_RETRY": {
      const syncMap = { ...state.syncMap };
      for (const id of action.ids) {
        syncMap[id] = { status: "pending" };
      }
      return { phase: "saving-questions", syncMap };
    }
    case "RESET":
      return initialSaveState;
  }
}

function buildQuestionInput(
  q: DraftQuestion,
  position: number
): CreateQuestionInput {
  if (q.type === "mcq") {
    return {
      type: "mcq",
      prompt: q.prompt,
      options: q.options,
      correctAnswer: String(q.correctAnswer),
      position,
    };
  }
  return {
    type: "short",
    prompt: q.prompt,
    correctAnswer: q.correctAnswer,
    position,
  };
}

export function useSaveQuiz() {
  const [state, dispatch] = useReducer(saveReducer, initialSaveState);
  const quizRef = useRef<Quiz | null>(null);
  const questionPositionsRef = useRef<Record<string, number>>({});

  const { phase, syncMap } = state;

  // Derived progress values
  const totalQuestions = Object.keys(syncMap).length;
  const savedCount = Object.values(syncMap).filter(
    (s) => s.status === "saved"
  ).length;
  const failedCount = Object.values(syncMap).filter(
    (s) => s.status === "failed"
  ).length;
  const isSaving = phase !== "idle" && phase !== "done" && phase !== "error";

  async function saveQuestionsWithConcurrency(
    quizId: number,
    questions: DraftQuestion[],
    limit: number,
    positionById?: Record<string, number>
  ): Promise<boolean> {
    let hasFailures = false;

    for (let i = 0; i < questions.length; i += limit) {
      const batch = questions.slice(i, i + limit);

      dispatch({ type: "SET_BATCH_SAVING", ids: batch.map((q) => q.id) });

      const results = await Promise.allSettled(
        batch.map((q, j) => {
          const position = positionById?.[q.id] ?? i + j;
          return Promise.resolve().then(() =>
            createQuestion(quizId, buildQuestionInput(q, position))
          );
        })
      );

      const updates: BatchUpdate = {};
      for (let j = 0; j < batch.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          updates[batch[j].id] = { status: "saved" };
        } else {
          updates[batch[j].id] = {
            status: "failed",
            error:
              result.reason instanceof Error
                ? result.reason.message
                : "Unknown error",
          };
          hasFailures = true;
        }
      }

      dispatch({ type: "SET_BATCH_RESULTS", updates });
    }

    return hasFailures;
  }

  const saveMutation = useMutation({
    mutationFn: async (draft: QuizDraft) => {
      dispatch({ type: "INIT_SAVE", questions: draft.questions });
      questionPositionsRef.current = Object.fromEntries(
        draft.questions.map((q, index) => [q.id, index])
      );

      const createdQuiz = await createQuiz({
        title: draft.title,
        description: draft.description,
        timeLimitSeconds: draft.timeLimitSeconds,
        isPublished: false,
      });
      quizRef.current = createdQuiz;

      dispatch({ type: "SET_PHASE", phase: "saving-questions" });
      const hasFailures = await saveQuestionsWithConcurrency(
        createdQuiz.id,
        draft.questions,
        3,
        questionPositionsRef.current
      );

      if (hasFailures) {
        throw new Error(
          "Some questions failed to save. You can retry the failed ones."
        );
      }

      dispatch({ type: "SET_PHASE", phase: "publishing" });
      await publishQuiz(createdQuiz.id);

      return createdQuiz;
    },
    onSuccess: () => dispatch({ type: "SET_PHASE", phase: "done" }),
    onError: () => dispatch({ type: "SET_PHASE", phase: "error" }),
  });

  const retryMutation = useMutation({
    mutationFn: async ({
      failedQuestions,
    }: {
      failedQuestions: DraftQuestion[];
    }) => {
      const quizId = quizRef.current?.id;
      if (!quizId) throw new Error("No quiz to retry against");

      const failedIds = failedQuestions.map((q) => q.id);

      if (failedIds.length === 0) return quizRef.current!;

      dispatch({ type: "MARK_RETRY", ids: failedIds });
      const hasFailures = await saveQuestionsWithConcurrency(
        quizId,
        failedQuestions,
        3,
        questionPositionsRef.current
      );

      if (hasFailures) {
        throw new Error("Some questions still failed. You can retry again.");
      }

      dispatch({ type: "SET_PHASE", phase: "publishing" });
      await publishQuiz(quizId);

      return quizRef.current!;
    },
    onSuccess: () => dispatch({ type: "SET_PHASE", phase: "done" }),
    onError: () => dispatch({ type: "SET_PHASE", phase: "error" }),
  });

  const {
    mutateAsync: saveAsync,
    data: saveData,
    error: saveError,
    reset: resetSave,
  } = saveMutation;

  const {
    mutateAsync: retryAsync,
    data: retryData,
    error: retryError,
    reset: resetRetry,
  } = retryMutation;

  const save = useCallback(
    (draft: QuizDraft) => saveAsync(draft).catch(() => {}),
    [saveAsync]
  );

  const retry = useCallback(
    (failedQuestions: DraftQuestion[]) =>
      retryAsync({ failedQuestions }).catch(() => {}),
    [retryAsync]
  );

  function reset() {
    dispatch({ type: "RESET" });
    quizRef.current = null;
    questionPositionsRef.current = {};
    resetSave();
    resetRetry();
  }

  const quiz = saveData ?? retryData ?? null;
  const globalError = saveError?.message ?? retryError?.message ?? null;

  return {
    phase,
    quiz,
    syncMap,
    globalError,
    isSaving,
    totalQuestions,
    savedCount,
    failedCount,
    save,
    retry,
    reset,
  };
}
