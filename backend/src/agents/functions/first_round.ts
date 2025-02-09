import fs from "fs";
import { tool } from "@langchain/core/tools";
import { StateAnnotation } from "../workflow/state_schema";
import path from "path";
import { structuredGeminiModel } from "../../utils/gemini.service";
import {
  hr_interview_response_schema,
  resume_response_schema,
} from "../workflow/gemini_schema";
import { fileToGenerativePart } from "../../utils/fileGenerative";
import {
  fetchResumeSummary,
  hr_question_generator,
} from "../prompts/firstRound.prompt";

export const startInterviewFunc = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Hello! I’ll be conducting your interview today. Before we begin, please select the interview type you’re applying for. Also, kindly upload your resume so I can review your qualifications and tailor the questions accordingly.",
    ],
  };
};

export const humanIntervieeSelectFeedback = (
  state: typeof StateAnnotation.State
) => {
  return {};
};

export const resumeTaker = (state: typeof StateAnnotation.State) => {
  return {};
};

export const evaluateResumeSchema = async (
  state: typeof StateAnnotation.State
) => {
  try {
    // Initialize Gemini model
    console.log("Inside Resume EValuator");

    const geminiModel = structuredGeminiModel(resume_response_schema);

    // Convert file to a generative part (Ensure it's an array)
    const fileParts = [
      fileToGenerativePart(state.resume_upload_path, "application/pdf"),
    ];

    // Generate content
    const result = await geminiModel.generateContent([
      ...fileParts,
      { text: fetchResumeSummary() },
    ]);

    const response = JSON.parse(result.response.text());
    console.log(response);

    return response;
  } catch (error) {
    console.error("Error evaluating resume:", error);
    throw error;
  }
};

export const init_hr_section = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Congragulation!, You have cleared the Previus Resume Evaluator Round.",
    ],
  };
};

export const reject_interview_process = (
  state: typeof StateAnnotation.State
) => {
  return {
    agent_message: [
      "Sorry! You are unable to clear the round! Please try again!",
    ],
  };
};

export const generateHrQuestions = async (
  state: typeof StateAnnotation.State
) => {
  const prompt = hr_question_generator(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? "",
    state.resume_summary,
    state.hr_question_answers_completed,
    state.interview_type
  );
  const geminiModel = structuredGeminiModel(hr_interview_response_schema);
  const result = await geminiModel.generateContent(prompt);
  const response = JSON.parse(result.response.text());
  console.log(response);

  return {
    agent_message: [response?.agent_message],
    hr_question_answers_completed: response?.hr_question_answers_completed,
    is_hr_questions_completed: response?.is_hr_questions_completed,
  };
};

export const humanHrFilterFeedback = (state: typeof StateAnnotation.State) => {
  return {};
};
