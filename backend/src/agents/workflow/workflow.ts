import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import {
  evaluateHrFilterRound,
  evaluateResumeSchema,
  generateHrQuestions,
  humanTechRoundFeeback,
  humanHrFilterFeedback,
  humanIntervieeSelectFeedback,
  init_hr_section,
  init_tech_round_one,
  reject_interview_process,
  resumeTaker,
  startInterviewFunc,
  init_tech_round_two,
  generateTechRoundOneQuestions,
  generateTechRoundTwoQuestions,
  generateTechRoundFunction,
} from "../functions/agent_func";
import { StateAnnotation } from "./state_schema";

let builder = new StateGraph(StateAnnotation)
  .addNode("start_interview", startInterviewFunc)
  .addNode("human_select_interview_type", humanIntervieeSelectFeedback)
  .addNode("human_resume_submit_feedback", resumeTaker)
  .addNode("resume_evaluator", evaluateResumeSchema)
  .addNode("welcome_hr_section", init_hr_section)
  .addNode("generate_hr_question", generateHrQuestions)
  .addNode("human_hr_filter_feedback", humanHrFilterFeedback)
  .addNode("hr_final_evaluation", evaluateHrFilterRound)
  .addNode("welcome_tech_round_one", init_tech_round_one)
  .addNode("generate_tech_round_one_questions", generateTechRoundOneQuestions)
  .addNode("human_tech_round_one_feedback", humanTechRoundFeeback)
  .addNode("welcome_tech_round_two", init_tech_round_two)
  .addNode("generate_tech_round_two_questions", generateTechRoundTwoQuestions)
  .addNode("human_tech_round_two_feedback", humanTechRoundFeeback)
  .addNode("evaluate_tech_round", generateTechRoundFunction)
  .addNode("reject_interview_process", reject_interview_process)
  .addNode("complete", () => ({
    agent_message: ["Interview process complete!"],
  }))
  .addEdge(START, "start_interview")
  .addEdge("start_interview", "human_resume_submit_feedback")
  .addEdge("human_resume_submit_feedback", "human_select_interview_type")
  .addConditionalEdges("human_select_interview_type", (state) =>
    state.interview_type?.length > 0
      ? "resume_evaluator"
      : "human_select_interview_type"
  )
  .addConditionalEdges("resume_evaluator", (state) =>
    state.resume_score > 70 ? "welcome_hr_section" : "reject_interview_process"
  )
  .addEdge("welcome_hr_section", "generate_hr_question")
  .addConditionalEdges("generate_hr_question", (state) =>
    state.is_hr_questions_completed
      ? "hr_final_evaluation"
      : "human_hr_filter_feedback"
  )
  .addEdge("human_hr_filter_feedback", "generate_hr_question")
  .addConditionalEdges("hr_final_evaluation", (state) =>
    state.is_hr_evaluation_pass
      ? "welcome_tech_round_one"
      : "reject_interview_process"
  )
  .addEdge("welcome_tech_round_one", "generate_tech_round_one_questions")
  .addConditionalEdges("generate_tech_round_one_questions", (state) =>
    state.tech_round_one_complete
      ? "welcome_tech_round_two"
      : "human_tech_round_one_feedback"
  )
  .addEdge("human_tech_round_one_feedback", "generate_tech_round_one_questions")
  .addEdge("welcome_tech_round_two", "generate_tech_round_two_questions")
  .addConditionalEdges("generate_tech_round_two_questions", (state) =>
    state.tech_round_two_complete
      ? "evaluate_tech_round"
      : "human_tech_round_two_feedback"
  )
  .addEdge("human_tech_round_two_feedback", "generate_tech_round_two_questions")
  .addEdge("evaluate_tech_round", "complete")
  .addEdge("complete", END);

export default builder;
