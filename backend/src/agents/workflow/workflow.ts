import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import {
  evaluateResumeSchema,
  init_hr_section,
  reject_interview_process,
  resumeTaker,
  startInterviewFunc,
} from "../functions/first_round";
import { StateAnnotation } from "./state_schema";

let builder = new StateGraph(StateAnnotation)
  .addNode("start_interview", startInterviewFunc)
  .addNode("human_resume_submit_feedback", resumeTaker)
  .addNode("resume_evaluator", evaluateResumeSchema)
  .addNode("welcome_hr_section", init_hr_section)
  .addNode("reject_interview_process", reject_interview_process)
  .addNode("complete", () => ({
    agent_message: ["Interview process complete!"],
  }))
  .addEdge(START, "start_interview")
  .addEdge("start_interview", "human_resume_submit_feedback")
  .addEdge("human_resume_submit_feedback", "resume_evaluator")
  .addConditionalEdges("resume_evaluator", (state) =>
    state.resume_score > 70 ? "complete" : "reject_interview_process"
  )
  .addEdge("complete", END);

export default builder;
