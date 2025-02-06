import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import {
  startInterviewFunc,
  uploadResumeTakerFunc,
} from "../functions/first_round";
import { StateAnnotation } from "./state_schema";

let builder = new StateGraph(StateAnnotation)
  .addNode("start_interview", startInterviewFunc)
  .addNode("resume_taker", uploadResumeTakerFunc)
  .addNode("complete", () => ({
    agent_message: ["Interview process complete!"],
  }))
  .addEdge("__start__", "start_interview")
  .addEdge("start_interview", "resume_taker")
  .addEdge("resume_taker", "complete");

export default builder;
