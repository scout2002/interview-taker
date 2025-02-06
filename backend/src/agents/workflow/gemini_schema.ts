import { SchemaType } from "@google/generative-ai";

export const resume_response_schema = {
  description:
    "Chatbot response with user query and model answer in markdown format",
  type: SchemaType.OBJECT,
  properties: {
    resume_summary: {
      type: SchemaType.STRING,
      description:
        "The summary of the user's resume or query that the chatbot responds to",
      nullable: false,
    },
    resume_score: {
      type: SchemaType.NUMBER,
      description:
        "The score assigned to the resume, based on the model's evaluation. This value should be a number.",
      nullable: false,
    },
  },
  required: ["resume_summary", "resume_score"],
};
