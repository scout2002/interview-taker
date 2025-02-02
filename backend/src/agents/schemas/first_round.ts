import { SchemaType } from "@google/generative-ai";

export const uploadResumeSchema = {
  description: "Extracted Resume Score from the Resume PDF",
  type: SchemaType.OBJECT,
  properties: {
    resume_score: {
      type: SchemaType.NUMBER,
      description: "The extracted resume score",
    },
  },
  required: ["resume_score"],
};
