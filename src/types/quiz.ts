export type QuestionType = "mcq" | "short" | "code"

export type Quiz = {
	id: number
	title: string
	description: string
	timeLimitSeconds?: number
	isPublished: boolean
	createdAt: string
}

export type McqQuestion = {
	id: number
	quizId: number
	type: "mcq"
	prompt: string
	options: string[]
	correctAnswer?: number | string
	position: number
}

export type ShortQuestion = {
	id: number
	quizId: number
	type: "short"
	prompt: string
	correctAnswer?: string
	position: number
}

export type CodeQuestion = {
	id: number
	quizId: number
	type: "code"
	prompt: string
	correctAnswer?: undefined
	position: number
}

export type Question = McqQuestion | ShortQuestion | CodeQuestion

// Distributive helper — strips correctAnswer from each member of the union individually
type OmitCorrectAnswer<T> = T extends unknown ? Omit<T, "correctAnswer"> : never
export type PlayerQuestion = OmitCorrectAnswer<Question>

export type QuizWithQuestions = Quiz & {
	questions: Question[]
}

export type AttemptAnswer = {
	questionId: number
	value: string
}

export type AttemptQuizSnapshot = {
	id: number
	title: string
	description: string
	timeLimitSeconds?: number
	questions: PlayerQuestion[]
}

export type AttemptStartResponse = {
	id: number
	quizId: number
	startedAt: string
	submittedAt: string | null
	answers: AttemptAnswer[]
	quiz: AttemptQuizSnapshot
}

export type SubmitAttemptDetail = {
	questionId: number
	correct: boolean
	expected?: string
}

export type SubmitAttemptResponse = {
	score: number
	details: SubmitAttemptDetail[]
}

export type CreateQuizInput = {
	title: string
	description: string
	timeLimitSeconds?: number
	isPublished: boolean
}

export type CreateMcqQuestionInput = {
	type: "mcq"
	prompt: string
	options: string[]
	correctAnswer: string
	position: number
}

export type CreateShortQuestionInput = {
	type: "short"
	prompt: string
	correctAnswer: string
	position: number
}

export type CreateCodeQuestionInput = {
	type: "code"
	prompt: string
	position: number
}

export type CreateQuestionInput =
	| CreateMcqQuestionInput
	| CreateShortQuestionInput
	| CreateCodeQuestionInput

export type StartAttemptInput = {
	quizId: number
}

export type SubmitAnswerInput = {
	questionId: number
	value: string
}

export type RecordEventInput = {
	event: string
}

export type DraftMcqQuestion = {
	id: string
	type: "mcq"
	prompt: string
	options: string[]
	correctAnswer: number
}

export type DraftShortQuestion = {
	id: string
	type: "short"
	prompt: string
	correctAnswer: string
}

export type DraftQuestion = DraftMcqQuestion | DraftShortQuestion

export type QuizDraft = {
	title: string
	description: string
	timeLimitSeconds?: number
	isPublished: boolean
	questions: DraftQuestion[]
}

export type QuestionValidationErrors = {
	prompt?: string
	options?: string
	correctAnswer?: string
}

export type QuizDraftValidationErrors = {
	title?: string
	description?: string
	questions?: string
	questionErrors: Record<string, QuestionValidationErrors>
}
