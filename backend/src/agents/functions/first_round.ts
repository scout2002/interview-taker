import { Request } from "express";

export const startInterviewFunc = () => {
  return {
    interviewee_message: [
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
