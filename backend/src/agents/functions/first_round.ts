import fs from "fs";
import { tool } from "@langchain/core/tools";
import { StateAnnotation } from "../workflow/state_schema";
import path from "path";
import { structuredGeminiModel } from "../../utils/gemini.service";
import { resume_response_schema } from "../workflow/gemini_schema";
import { fileToGenerativePart } from "../../utils/fileGenerative";
import { fetchResumeSummary } from "../prompts/firstRound.prompt";

export const startInterviewFunc = (state: typeof StateAnnotation.State) => {
  return {
    agent_message: [
      "Welcome to ZenCode Interview Process! Please submit your resume here.",
    ],
    next_state: "human_resume_submit_feedback",
  };
};

export const resumeTaker = (state: typeof StateAnnotation.State) => {
  return {};
};

export const evaluateResumeSchema = async (
  state: typeof StateAnnotation.State
) => {
  try {
    // Initialize Gemini model
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
