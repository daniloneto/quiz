export interface Option {
  text: string
  correct?: boolean
}

export interface Question {
  question: string
  options: Option[]
}

export interface Quiz {
  title: string
  questions: Question[]
}

export interface Exam {
  id: string
  title: string
  description?: string
  quizzes?: Quiz[]
  createdAt?: string
}

export interface PaginatedExams {
  exams: Exam[]
  total: number
  page: number
  totalPages: number
}

