import { SchemaType } from "@google/generative-ai";

export const uploadResumeSchema = {
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
    resume_rating: {
      type: SchemaType.STRING,
      enum: ["Weak", "Average", "Strong"],
      description:
        "Categorization based on resume quality: Weak (50-69), Average (70-85), Strong (86-100).",
    },
  },
  required: ["resume_score", "resume_summary", "keywords", "rating"],
};
