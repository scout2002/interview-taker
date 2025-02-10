import fs from "fs";
import { tool } from "@langchain/core/tools";
import { StateAnnotation } from "../workflow/state_schema";
import path from "path";
import { structuredGeminiModel } from "../../utils/gemini.service";
import {
  hr_interview_evaluation_schema,
  hr_interview_response_schema,
  resume_response_schema,
  tech_round_one_interview_response_schema,
} from "../workflow/gemini_schema";
import { fileToGenerativePart } from "../../utils/fileGenerative";
import {
  fetchResumeSummary,
  generateTechRoundOnePrompt,
  hr_genertor_system_prompt,
  hr_question_generator,
  hr_user_prompt,
  hrEvaluationPrompt,
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
  console.log("Generating HR QUESTIONS");

  const system_prompt = hr_genertor_system_prompt(
    state.resume_summary,
    state.hr_question_answers_completed,
    state.interview_type
  );
  const userPrompt = hr_user_prompt(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? ""
  );
  const geminiModel = structuredGeminiModel(
    hr_interview_response_schema,
    system_prompt
  );
  const result = await geminiModel.generateContent(userPrompt);
  const response = JSON.parse(result.response.text());

  return {
    agent_message: [response?.agent_message],
    hr_question_answers_completed: response?.hr_question_answers_completed,
    is_hr_questions_completed: response?.is_hr_questions_completed,
  };
};

export const humanHrFilterFeedback = (state: typeof StateAnnotation.State) => {
  return {};
};

export const evaluateHrFilterRound = async (
  state: typeof StateAnnotation.State
) => {
  console.log("Evalatuing HR QUESTIONS");

  const prompt = hrEvaluationPrompt(state.hr_question_answers_completed);
  const geminiModel = structuredGeminiModel(hr_interview_evaluation_schema);
  const result = await geminiModel.generateContent(prompt);
  const response = JSON.parse(result.response.text());
  return response;
};

export const init_tech_round_one = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Congratulations! You have successfully cleared the previous HR Evaluator Round. Your performance has been commendable, and we are excited to move you forward to the next stage of the selection process. Prepare well and give your best in the upcoming technical round. Good luck!",
    ],
  };
};

export const humanTechRoundFeeback = (state: typeof StateAnnotation.State) => {
  return {};
};

export const generate_tech_round_one_questions = async (
  state: typeof StateAnnotation.State
) => {
  const prompt = generateTechRoundOnePrompt(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? "",
    state.resume_summary,
    state.tech_round_one_data,
    state.interview_type,
    state.resume_keywords
  );
  const geminiModel = structuredGeminiModel(
    tech_round_one_interview_response_schema
  );
  const result = await geminiModel.generateContent(prompt);
  const response = JSON.parse(result.response.text());

  return {
    agent_message: [response?.agent_message],
    tech_round_one_data: response?.tech_round_one_data,
    tech_round_one_complete: response?.tech_round_one_complete,
  };
};
