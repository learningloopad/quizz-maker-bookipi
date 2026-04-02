import { apiRequest } from "./client";
import type {
  CreateQuestionInput,
  CreateQuizInput,
  Question,
  Quiz,
} from "../types/quiz";

export function createQuiz(input: CreateQuizInput) {
  return apiRequest<Quiz>("/quizzes", {
    method: "POST",
    body: input,
  });
}

export function createQuestion(quizId: number, input: CreateQuestionInput) {
  return apiRequest<Question>(`/quizzes/${quizId}/questions`, {
    method: "POST",
    body: input,
  });
}
