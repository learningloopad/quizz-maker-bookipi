import { apiRequest } from "./client"
import type {
	AttemptStartResponse,
	RecordEventInput,
	StartAttemptInput,
	SubmitAnswerInput,
	SubmitAttemptResponse,
} from "../types/quiz"

export function startAttempt(input: StartAttemptInput) {
	return apiRequest<AttemptStartResponse>("/attempts", {
		method: "POST",
		body: input,
	})
}

export function submitAnswer(attemptId: number, input: SubmitAnswerInput) {
	return apiRequest<{ ok: true }>(`/attempts/${attemptId}/answer`, {
		method: "POST",
		body: input,
	})
}

export function recordEvent(attemptId: number, input: RecordEventInput) {
	return apiRequest<{ ok: true }>(`/attempts/${attemptId}/events`, {
		method: "POST",
		body: input,
	})
}

export function submitAttempt(attemptId: number) {
	return apiRequest<SubmitAttemptResponse>(`/attempts/${attemptId}/submit`, {
		method: "POST",
	})
}
