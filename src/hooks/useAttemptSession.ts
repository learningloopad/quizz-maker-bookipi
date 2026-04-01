import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import {
	startAttempt,
	submitAnswer,
	submitAttempt,
	recordEvent,
} from "../api/attempts"
import type { AntiCheatEvent } from "./useAntiCheat"

type SessionPhase =
	| "idle"
	| "loading"
	| "active"
	| "submitting"
	| "results"
	| "error"

export function useAttemptSession() {
	const [answers, setAnswers] = useState<Record<number, string>>({})

	const startMutation = useMutation({
		mutationFn: (quizId: number) => startAttempt({ quizId }),
	})

	const submitMutation = useMutation({
		mutationFn: async ({
			attemptId,
			answers: answerEntries,
			antiCheatEvents,
		}: {
			attemptId: number
			answers: Record<number, string>
			antiCheatEvents?: AntiCheatEvent[]
		}) => {
			// 1) Flush anti-cheat events
			if (antiCheatEvents && antiCheatEvents.length > 0) {
				await Promise.allSettled(
					antiCheatEvents.map((evt) =>
						recordEvent(attemptId, {
							event:
								evt.type === "paste"
									? `paste:question:${evt.questionId}`
									: evt.type,
						}),
					),
				)
			}

			// 2) Submit each answer
			for (const [questionId, value] of Object.entries(answerEntries)) {
				await submitAnswer(attemptId, {
					questionId: Number(questionId),
					value,
				})
			}

			// 3) Finalize attempt
			return submitAttempt(attemptId)
		},
	})

	function getPhase(): SessionPhase {
		if (submitMutation.isSuccess) return "results"
		if (submitMutation.isPending) return "submitting"
		if (submitMutation.isError) return "error"
		if (startMutation.isSuccess) return "active"
		if (startMutation.isPending) return "loading"
		if (startMutation.isError) return "error"
		return "idle"
	}

	function start(quizId: number) {
		// Reset everything for a fresh attempt
		submitMutation.reset()
		setAnswers({})
		startMutation.mutate(quizId)
	}

	function setAnswer(questionId: number, value: string) {
		setAnswers((prev) => ({ ...prev, [questionId]: value }))
	}

	function submit(antiCheatEvents?: AntiCheatEvent[]) {
		if (!startMutation.data) return

		submitMutation.mutate({
			attemptId: startMutation.data.id,
			answers,
			antiCheatEvents,
		})
	}

	function reset() {
		startMutation.reset()
		submitMutation.reset()
		setAnswers({})
	}

	return {
		session: {
			phase: getPhase(),
			attempt: startMutation.data ?? null,
			answers,
			result: submitMutation.data ?? null,
			error:
				startMutation.error?.message ??
				submitMutation.error?.message ??
				null,
		},
		start,
		setAnswer,
		submit,
		reset,
	}
}
