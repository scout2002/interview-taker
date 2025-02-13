import { BaseMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export enum InterviewType {
  JAVA_BACKEND = "Java Backend Developer",
  JAVASCRIPT_FULLSTACK = "JavaScript Full Stack Developer",
  REACT_FRONTEND = "React Frontend Developer",
  MERN_STACK = "MERN Stack Developer",
  PYTHON_BACKEND = "Python Backend Developer",
  DATA_ENGINEER = "Data Engineer",
  DEVOPS_ENGINEER = "DevOps Engineer",
  MOBILE_DEVELOPER = "Mobile App Developer",
  MACHINE_LEARNING = "Machine Learning Engineer",
  CYBER_SECURITY = "Cyber Security Specialist",
  DATA_SCIENTIST = "Data Scientist",
  AI_ENGINEER = "AI Engineer",
  CLOUD_ENGINEER = "Cloud Engineer",
  SOFTWARE_ARCHITECT = "Software Architect",
  FRONTEND_ENGINEER = "Frontend Engineer",
  BACKEND_ENGINEER = "Backend Engineer",
  FULLSTACK_ENGINEER = "Full Stack Engineer",
  BLOCKCHAIN_DEVELOPER = "Blockchain Developer",
  GAME_DEVELOPER = "Game Developer",
  EMBEDDED_SYSTEMS_ENGINEER = "Embedded Systems Engineer",
}

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
  interview_type: Annotation<string>,
  is_hr_evaluation_pass: Annotation<boolean>,
  tech_round_one_data: Annotation<
    [
      {
        tech_question: string;
        user_answer: string;
      }
    ]
  >,
  tech_round_one_complete: Annotation<Boolean>,
  tech_round_two_data: Annotation<
    [
      {
        tech_question: string;
        user_answer: string;
      }
    ]
  >,
  tech_round_two_complete: Annotation<Boolean>,
  salary_approved: Annotation<number>,
  tech_round_evaluation: Annotation<Boolean>,
  is_final_hr_questions_completed: Annotation<boolean>,
  final_hr_question_answers_completed: Annotation<
    { hr_question: string; user_answer: string }[]
  >({
    default: () => [],
    reducer: (prev, next) => [...prev, ...next],
  }),
  final_salary_bargained: Annotation<number>,
});
