export const quizKeys = {
  all: ["quizzes"] as const,
  detail: (id: number) => ["quizzes", id] as const,
};
