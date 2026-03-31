import { useState } from "react"
import { createQuiz, createQuestion } from "../api/quizzes"
import type { Quiz, QuizDraft, CreateQuestionInput } from "../types/quiz"

type SaveState = {
	status: "idle" | "saving" | "success" | "error"
	quiz: Quiz | null
	error: string | null
	progress: { current: number; total: number }
}

export function useCreateQuizWithQuestions() {
	const [state, setState] = useState<SaveState>({
		status: "idle",
		quiz: null,
		error: null,
		progress: { current: 0, total: 0 },
	})

	async function save(draft: QuizDraft) {
		setState({
			status: "saving",
			quiz: null,
			error: null,
			progress: { current: 0, total: draft.questions.length + 1 },
		})

		try {
			// Step 1: create quiz
			const quiz = await createQuiz({
				title: draft.title,
				description: draft.description,
				timeLimitSeconds: draft.timeLimitSeconds,
				isPublished: draft.isPublished,
			})

			setState((prev) => ({
				...prev,
				progress: { ...prev.progress, current: 1 },
			}))

			// Step 2: create questions sequentially
			for (let i = 0; i < draft.questions.length; i++) {
				const q = draft.questions[i]
				let input: CreateQuestionInput

				if (q.type === "mcq") {
					input = {
						type: "mcq",
						prompt: q.prompt,
						options: q.options,
						correctAnswer: String(q.correctAnswer),
						position: i,
					}
				} else {
					input = {
						type: "short",
						prompt: q.prompt,
						correctAnswer: q.correctAnswer,
						position: i,
					}
				}

				await createQuestion(quiz.id, input)

				setState((prev) => ({
					...prev,
					progress: { ...prev.progress, current: i + 2 },
				}))
			}

			setState({
				status: "success",
				quiz,
				error: null,
				progress: {
					current: draft.questions.length + 1,
					total: draft.questions.length + 1,
				},
			})
		} catch (err) {
			setState((prev) => ({
				...prev,
				status: "error",
				error: err instanceof Error ? err.message : "Failed to save quiz",
			}))
		}
	}

	function reset() {
		setState({
			status: "idle",
			quiz: null,
			error: null,
			progress: { current: 0, total: 0 },
		})
	}

	return { ...state, save, reset }
}
