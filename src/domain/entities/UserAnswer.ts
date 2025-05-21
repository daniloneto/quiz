export interface UserAnswer {
  questionId: string; // Assumes questions will have unique IDs accessible during quiz taking
  submittedAnswer: string; // string for T/F, Short Answer, and the text of the chosen option for MCQ
}
