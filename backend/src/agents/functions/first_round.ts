import { tool } from "@langchain/core/tools";
import { StateAnnotation } from "../workflow/state_schema";

export const startInterviewFunc = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Welcome to ZenCode Interview Process! Please submit your resume here.",
    ],
    next_state: "resume_taker",
  };
};

export const uploadResumeTakerFunc = () => {
  return {
    interviewee_message: [
      "Welcome to ZenCode Interview Process! Please submit your resume here.",
    ],
    next_state: "resume_taker",
  };
};
