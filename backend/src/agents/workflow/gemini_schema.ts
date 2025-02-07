import { SchemaType } from "@google/generative-ai";

export const resume_response_schema = {
  description:
    "Extracted resume details including score, summary, and key skills.",
  type: SchemaType.OBJECT,
  properties: {
    resume_score: {
      type: SchemaType.NUMBER,
      description:
        "The extracted resume score (50-100) based on quality and relevance.",
    },
    resume_summary: {
      type: SchemaType.STRING,
      description:
        "A concise and detailed summary of the candidate’s skills, experience, and qualifications.",
    },
    resume_keywords: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description:
        "Important keywords extracted from the resume, such as skills, certifications, or industry-specific terms.",
    },
  },
  required: ["resume_score", "resume_summary", "resume_keywords"],
};
