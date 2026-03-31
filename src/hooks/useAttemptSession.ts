import { useState } from "react"
import {
	startAttempt,
	submitAnswer,
	submitAttempt,
	recordEvent,
} from "../api/attempts"
import type { AttemptStartResponse, SubmitAttemptResponse } from "../types/quiz"
import type { AntiCheatEvent } from "./useAntiCheat"

type SessionPhase =
	| "idle"
	| "loading"
	| "active"
	| "submitting"
	| "results"
	| "error"

type Session = {
	phase: SessionPhase
	attempt: AttemptStartResponse | null
	answers: Record<number, string>
	result: SubmitAttemptResponse | null
	error: string | null
}

export function useAttemptSession() {
	const [session, setSession] = useState<Session>({
		phase: "idle",
		attempt: null,
		answers: {},
		result: null,
		error: null,
	})

	async function start(quizId: number) {
		setSession({
			phase: "loading",
			attempt: null,
			answers: {},
			result: null,
			error: null,
		})

		try {
			const attempt = await startAttempt({ quizId })
			setSession({
				phase: "active",
				attempt,
				answers: {},
				result: null,
				error: null,
			})
		} catch (err) {
			setSession({
				phase: "error",
				attempt: null,
				answers: {},
				result: null,
				error: err instanceof Error ? err.message : "Failed to start attempt",
			})
		}
	}

	function setAnswer(questionId: number, value: string) {
		setSession((prev) => ({
			...prev,
			answers: { ...prev.answers, [questionId]: value },
		}))
	}

	async function submit(antiCheatEvents?: AntiCheatEvent[]) {
		if (!session.attempt) return

		setSession((prev) => ({ ...prev, phase: "submitting" }))

		try {
			const attemptId = session.attempt.id

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
			const answerEntries = Object.entries(session.answers)
			for (const [questionId, value] of answerEntries) {
				await submitAnswer(attemptId, {
					questionId: Number(questionId),
					value,
				})
			}

			// 3) Finalize attempt
			const result = await submitAttempt(attemptId)

			setSession((prev) => ({ ...prev, phase: "results", result }))
		} catch (err) {
			setSession((prev) => ({
				...prev,
				phase: "error",
				error: err instanceof Error ? err.message : "Failed to submit attempt",
			}))
		}
	}

	function reset() {
		setSession({
			phase: "idle",
			attempt: null,
			answers: {},
			result: null,
			error: null,
		})
	}

	return { session, start, setAnswer, submit, reset }
}
