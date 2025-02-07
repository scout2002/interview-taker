import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import {
  evaluateResumeSchema,
  resumeTaker,
  startInterviewFunc,
} from "../functions/first_round";
import { StateAnnotation } from "./state_schema";

let builder = new StateGraph(StateAnnotation)
  .addNode("start_interview", startInterviewFunc)
  .addNode("human_resume_submit_feedback", resumeTaker)
  .addNode("resume_evaluator", evaluateResumeSchema)
  .addNode("complete", () => ({
    agent_message: ["Interview process complete!"],
  }))
  .addEdge("__start__", "start_interview")
  .addEdge("start_interview", "human_resume_submit_feedback")
  .addEdge("human_resume_submit_feedback", "resume_evaluator")
  .addEdge("resume_evaluator", "complete");

export default builder;
