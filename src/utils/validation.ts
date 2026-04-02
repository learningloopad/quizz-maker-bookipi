import type {
  QuizDraft,
  QuizDraftValidationErrors,
  QuestionValidationErrors,
} from "../types/quiz";
import { MAX_QUESTION } from "../lib/constants";

export function validateQuizDraft(draft: QuizDraft): QuizDraftValidationErrors {
  const errors: QuizDraftValidationErrors = {
    questionErrors: {},
  };

  if (!draft.title.trim()) {
    errors.title = "Title is required";
  }

  if (!draft.description.trim()) {
    errors.description = "Description is required";
  }

  if (draft.questions.length === 0) {
    errors.questions = "Add at least one question";
  } else if (draft.questions.length > MAX_QUESTION) {
    errors.questions = `You can add up to ${MAX_QUESTION} questions only`;
  }

  for (const question of draft.questions) {
    const qErrors: QuestionValidationErrors = {};

    if (!question.prompt.trim()) {
      qErrors.prompt = "Prompt is required";
    }

    if (question.type === "mcq") {
      if (question.options.length < 2) {
        qErrors.options = "MCQ needs at least 2 options";
      } else if (question.options.some((opt) => !opt.trim())) {
        qErrors.options = "All options must be non-empty";
      }

      if (
        question.correctAnswer < 0 ||
        question.correctAnswer >= question.options.length
      ) {
        qErrors.correctAnswer = "Select a valid correct option";
      }
    }

    if (question.type === "short") {
      if (!question.correctAnswer.trim()) {
        qErrors.correctAnswer = "Correct answer is required";
      }
    }

    if (Object.keys(qErrors).length > 0) {
      errors.questionErrors[question.id] = qErrors;
    }
  }

  return errors;
}

export function hasErrors(errors: QuizDraftValidationErrors): boolean {
  return !!(
    errors.title ||
    errors.description ||
    errors.questions ||
    Object.keys(errors.questionErrors).length > 0
  );
}
