import { apiRequest } from "./client"
import type {
	CreateQuestionInput,
	CreateQuizInput,
	Question,
	Quiz,
	QuizWithQuestions,
} from "../types/quiz"

export function listQuizzes() {
	return apiRequest<Quiz[]>("/quizzes")
}

export function createQuiz(input: CreateQuizInput) {
	return apiRequest<Quiz>("/quizzes", {
		method: "POST",
		body: input,
	})
}

export function getQuizById(quizId: number) {
	return apiRequest<QuizWithQuestions>(`/quizzes/${quizId}`)
}

export function createQuestion(quizId: number, input: CreateQuestionInput) {
	return apiRequest<Question>(`/quizzes/${quizId}/questions`, {
		method: "POST",
		body: input,
	})
}
