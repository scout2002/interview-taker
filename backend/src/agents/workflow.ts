import { BaseMessage } from "@langchain/core/messages";
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import {
  startInterviewFunc,
  uploadResumeTakerFunc,
} from "./functions/first_round";

export const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  next_state: Annotation<String>,
  resume_score: Annotation<Number>,
});

let builder = new StateGraph(StateAnnotation)
  .addNode("start_interview", startInterviewFunc)
  .addNode("resume_taker", uploadResumeTakerFunc)
  .addEdge("__start__", "start_interview");

export default builder;
