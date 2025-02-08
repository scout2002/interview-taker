import { BaseMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  agent_message: Annotation<string[]>({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next],
  }),
  user_message: Annotation<string[]>({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next],
  }),
  resume_summary: Annotation<string>,
  next_state: Annotation<string>,
  resume_score: Annotation<number> || 89,
  thread_id: Annotation<string>,
  resume_upload_path: Annotation<string>,
  resume_keywords: Annotation<string[]>,
  resume_rating: Annotation<string[]>,
  is_hr_questions_completed: Annotation<boolean>,
  hr_question_answers_completed: Annotation<
    { hr_question: string; user_answer: string }[]
  >({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next],
  }),
});
