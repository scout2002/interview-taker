import fs from "fs";
import { tool } from "@langchain/core/tools";
import { StateAnnotation } from "../workflow/state_schema";
import path from "path";
import { structuredGeminiModel } from "../../utils/gemini.service";
import {
  final_hr_interview_response_schema,
  hr_interview_evaluation_schema,
  hr_interview_response_schema,
  resume_response_schema,
  tech_round_evaluation_schema,
  tech_round_one_interview_response_schema,
  tech_round_two_interview_response_schema,
} from "../workflow/gemini_schema";
import { fileToGenerativePart } from "../../utils/fileGenerative";
import {
  evaluationTechRoundAnswerPrompt,
  evaluationTechRoundUserAnswerPrompt,
  fetchResumeSummary,
  generateFinalHrUserPrompt,
  generateTechRoundOneSystemPrompt,
  generateTechRoundOneUserPrompt,
  generateTechRoundTwoSystemPrompt,
  generateTechRoundTwoUserPrompt,
  hr_final_generator_system_prompt,
  hr_genertor_system_prompt,
  hr_user_prompt,
  hrEvaluationPrompt,
  HRQuestionAnswer,
  InterviewRQuestionAnswer,
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

export const generateTechRoundOneQuestions = async (
  state: typeof StateAnnotation.State
) => {
  console.log("GENERATING TECH ROUND ONE");

  const systemPrompt = generateTechRoundOneSystemPrompt(
    state.resume_summary,
    state.tech_round_one_data,
    state.interview_type,
    state.resume_keywords
  );
  const userPrompt = generateTechRoundOneUserPrompt(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? ""
  );
  const geminiModel = structuredGeminiModel(
    tech_round_one_interview_response_schema,
    systemPrompt
  );
  const result = await geminiModel.generateContent(userPrompt);
  const response = JSON.parse(result.response.text());

  return {
    agent_message: [response?.agent_message],
    tech_round_one_data: response?.tech_round_one_data,
    tech_round_one_complete: response?.tech_round_one_complete,
  };
};

export const init_tech_round_two = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Congratulations! You have successfully cleared the first technical round. Your skills and problem-solving abilities have impressed us, and we are excited to move you forward to the next stage. Get ready for a more in-depth technical evaluation. Prepare well, stay confident, and give it your best shot. Good luck!",
    ],
  };
};

export const generateTechRoundTwoQuestions = async (
  state: typeof StateAnnotation.State
) => {
  console.log("GENERATING TECH ROUND TWO");

  const systemPrompt = generateTechRoundTwoSystemPrompt(
    state.resume_summary,
    state.tech_round_two_data,
    state.interview_type,
    state.resume_keywords
  );
  const userPrompt = generateTechRoundTwoUserPrompt(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? ""
  );
  const geminiModel = structuredGeminiModel(
    tech_round_two_interview_response_schema,
    systemPrompt
  );
  const result = await geminiModel.generateContent(userPrompt);
  const response = JSON.parse(result.response.text());

  return {
    agent_message: [response?.agent_message],
    tech_round_two_data: response?.tech_round_two_data,
    tech_round_two_complete: response?.tech_round_two_complete,
  };
};

export const generateTechRoundEvaluationFunction = async (
  state: typeof StateAnnotation.State
) => {
  console.log("inside Tech Evaluator ROund");

  const systemPrompt = evaluationTechRoundAnswerPrompt(
    state.tech_round_one_data,
    state.tech_round_two_data,
    state.interview_type
  );

  const userPrompt = evaluationTechRoundUserAnswerPrompt(
    state.tech_round_one_data,
    state.tech_round_two_data,
    state.interview_type
  );

  const geminiModel = structuredGeminiModel(
    tech_round_evaluation_schema,
    systemPrompt
  );
  const result = await geminiModel.generateContent(userPrompt);
  const response = JSON.parse(result.response.text());

  return response;
};

export const init_final_hr_round = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      `Congratulations! You've successfully cleared both technical evaluation rounds! Your skills and problem-solving abilities have truly impressed us. We're thrilled to move you forward to the final HR round. In this round, we'll discuss the approved salary of ${state.salary_approved} and finalize the remaining details. This is the last step before you officially join our team! Prepare any questions you may have regarding compensation, benefits, company culture, or anything else. We look forward to welcoming you aboard!`,
    ],
  };
};

export const generatFinaleHrQuestions = async (
  state: typeof StateAnnotation.State
) => {
  console.log("Generating Final HR QUESTIONS");
  const system_prompt = hr_final_generator_system_prompt(
    state.final_hr_question_answers_completed,
    state.salary_approved,
    state.interview_type
  );
  const userPrompt = generateFinalHrUserPrompt(
    state.agent_message.at(-1) ?? "",
    state.user_message.at(-1) ?? ""
  );
  const geminiModel = structuredGeminiModel(
    final_hr_interview_response_schema,
    system_prompt
  );
  const result = await geminiModel.generateContent(userPrompt);
  const response = JSON.parse(result.response.text());

  return {
    agent_message: [response?.agent_message],
    final_hr_question_answers_completed:
      response?.final_hr_question_answers_completed,
    is_final_hr_questions_completed: response?.is_final_hr_questions_completed,
    final_salary_bargained: response?.final_salary_bargained,
  };
};

export const humanFinalHrRoundFeeback = (
  state: typeof StateAnnotation.State
) => {
  return {};
};
