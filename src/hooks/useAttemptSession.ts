import { useCallback, useReducer } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  startAttempt,
  submitAnswer,
  submitAttempt,
  recordEvent,
} from "../api/attempts";
import type { AntiCheatEvent } from "./useAntiCheat";

type SessionPhase =
  | "idle"
  | "loading"
  | "active"
  | "submitting"
  | "grading"
  | "results"
  | "error";

type AnswerSyncStatus = "pending" | "saving" | "saved" | "failed";
type AnswerSyncMap = Record<
  number,
  { status: AnswerSyncStatus; error?: string }
>;

type AttemptState = {
  answers: Record<number, string>;
  answerSyncMap: AnswerSyncMap;
  submitPhase: "idle" | "answers" | "grading";
};

type AnswerBatchUpdate = Record<
  number,
  { status: "saved" | "failed"; error?: string }
>;

type AttemptAction =
  | { type: "SET_ANSWER"; questionId: number; value: string }
  | { type: "INIT_SUBMIT"; entries: [number, string][] }
  | { type: "SET_SUBMIT_PHASE"; phase: "idle" | "answers" | "grading" }
  | { type: "SET_BATCH_SAVING"; ids: number[] }
  | { type: "SET_BATCH_RESULTS"; updates: AnswerBatchUpdate }
  | { type: "MARK_RETRY"; failedIds: number[] }
  | { type: "RESET" };

const initialAttemptState: AttemptState = {
  answers: {},
  answerSyncMap: {},
  submitPhase: "idle",
};

function attemptReducer(
  state: AttemptState,
  action: AttemptAction
): AttemptState {
  switch (action.type) {
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
      };
    case "INIT_SUBMIT": {
      const answerSyncMap: AnswerSyncMap = {};
      for (const [questionId] of action.entries) {
        answerSyncMap[questionId] = { status: "pending" };
      }
      return { ...state, answerSyncMap, submitPhase: "answers" };
    }
    case "SET_SUBMIT_PHASE":
      return { ...state, submitPhase: action.phase };
    case "SET_BATCH_SAVING": {
      const answerSyncMap = { ...state.answerSyncMap };
      for (const id of action.ids) {
        answerSyncMap[id] = { status: "saving" };
      }
      return { ...state, answerSyncMap };
    }
    case "SET_BATCH_RESULTS":
      return {
        ...state,
        answerSyncMap: { ...state.answerSyncMap, ...action.updates },
      };
    case "MARK_RETRY": {
      const answerSyncMap = { ...state.answerSyncMap };
      for (const id of action.failedIds) {
        answerSyncMap[id] = { status: "pending" };
      }
      return { ...state, answerSyncMap, submitPhase: "answers" };
    }
    case "RESET":
      return initialAttemptState;
  }
}

export function useAttemptSession() {
  const [state, dispatch] = useReducer(attemptReducer, initialAttemptState);
  const { answers, answerSyncMap, submitPhase } = state;

  const totalAnswers = Object.keys(answerSyncMap).length;
  const savedAnswers = Object.values(answerSyncMap).filter(
    (s) => s.status === "saved"
  ).length;
  const failedAnswers = Object.values(answerSyncMap).filter(
    (s) => s.status === "failed"
  ).length;

  const startMutation = useMutation({
    mutationFn: (quizId: number) => startAttempt({ quizId }),
  });

  async function submitAnswersWithConcurrency(
    attemptId: number,
    answerEntries: [number, string][],
    limit: number
  ): Promise<boolean> {
    let hasFailures = false;

    for (let i = 0; i < answerEntries.length; i += limit) {
      const batch = answerEntries.slice(i, i + limit);

      dispatch({ type: "SET_BATCH_SAVING", ids: batch.map(([id]) => id) });

      const results = await Promise.allSettled(
        batch.map(([questionId, value]) =>
          submitAnswer(attemptId, { questionId, value })
        )
      );

      const updates: AnswerBatchUpdate = {};
      for (let j = 0; j < batch.length; j++) {
        const [questionId] = batch[j];
        const result = results[j];
        if (result.status === "fulfilled") {
          updates[questionId] = { status: "saved" };
        } else {
          updates[questionId] = {
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

  const submitMutation = useMutation({
    mutationFn: async ({
      attemptId,
      answers: answerEntries,
      antiCheatEvents,
    }: {
      attemptId: number;
      answers: Record<number, string>;
      antiCheatEvents?: AntiCheatEvent[];
    }) => {
      // 1) Flush anti-cheat events (fire-and-forget)
      if (antiCheatEvents && antiCheatEvents.length > 0) {
        await Promise.allSettled(
          antiCheatEvents.map((evt) =>
            recordEvent(attemptId, {
              event:
                evt.type === "paste"
                  ? `paste:question:${evt.questionId}`
                  : evt.type,
            })
          )
        );
      }

      // 2) Initialize sync map — all answers start as "pending"
      const entries = Object.entries(answerEntries).map(
        ([qid, value]) => [Number(qid), value] as [number, string]
      );
      dispatch({ type: "INIT_SUBMIT", entries });

      // 3) Submit answers with concurrency limit
      const hasFailures = await submitAnswersWithConcurrency(
        attemptId,
        entries,
        3
      );

      if (hasFailures) {
        throw new Error(
          "Some answers failed to submit. You can retry the failed ones."
        );
      }

      // 4) Finalize attempt
      dispatch({ type: "SET_SUBMIT_PHASE", phase: "grading" });
      return submitAttempt(attemptId);
    },
    onSettled: () => dispatch({ type: "SET_SUBMIT_PHASE", phase: "idle" }),
  });

  const retryMutation = useMutation({
    mutationFn: async ({ attemptId }: { attemptId: number }) => {
      const failedEntries: [number, string][] = Object.entries(answerSyncMap)
        .filter(([, sync]) => sync.status === "failed")
        .map(([qidStr]) => {
          const qid = Number(qidStr);
          return [qid, answers[qid] ?? ""] as [number, string];
        });

      if (failedEntries.length === 0) return;

      dispatch({
        type: "MARK_RETRY",
        failedIds: failedEntries.map(([id]) => id),
      });

      const hasFailures = await submitAnswersWithConcurrency(
        attemptId,
        failedEntries,
        3
      );

      if (hasFailures) {
        throw new Error("Some answers still failed. You can retry again.");
      }

      dispatch({ type: "SET_SUBMIT_PHASE", phase: "grading" });
      return submitAttempt(attemptId);
    },
    onSettled: () => dispatch({ type: "SET_SUBMIT_PHASE", phase: "idle" }),
  });

  function getPhase(): SessionPhase {
    if (submitMutation.isSuccess || retryMutation.isSuccess) return "results";
    if (submitMutation.isPending || retryMutation.isPending) {
      return submitPhase === "grading" ? "grading" : "submitting";
    }
    if (submitMutation.isError || retryMutation.isError) return "error";
    if (startMutation.isSuccess) return "active";
    if (startMutation.isPending) return "loading";
    if (startMutation.isError) return "error";
    return "idle";
  }

  function start(quizId: number) {
    submitMutation.reset();
    retryMutation.reset();
    dispatch({ type: "RESET" });
    startMutation.mutate(quizId);
  }

  function setAnswer(questionId: number, value: string) {
    dispatch({ type: "SET_ANSWER", questionId, value });
  }

  function submit(antiCheatEvents?: AntiCheatEvent[]) {
    if (!startMutation.data) return;

    retryMutation.reset();
    submitMutation.mutate({
      attemptId: startMutation.data.id,
      answers,
      antiCheatEvents,
    });
  }

  const { mutate: retryMutate } = retryMutation;
  const { reset: resetSubmit } = submitMutation;

  const retry = useCallback(() => {
    if (!startMutation.data) return;

    resetSubmit();
    retryMutate({ attemptId: startMutation.data.id });
  }, [startMutation.data, resetSubmit, retryMutate]);

  function reset() {
    startMutation.reset();
    submitMutation.reset();
    retryMutation.reset();
    dispatch({ type: "RESET" });
  }

  return {
    session: {
      phase: getPhase(),
      attempt: startMutation.data ?? null,
      answers,
      result: submitMutation.data ?? retryMutation.data ?? null,
      error:
        startMutation.error?.message ??
        submitMutation.error?.message ??
        retryMutation.error?.message ??
        null,
      answerSyncMap,
      totalAnswers,
      savedAnswers,
      failedAnswers,
    },
    start,
    setAnswer,
    submit,
    retry,
    reset,
  };
}
