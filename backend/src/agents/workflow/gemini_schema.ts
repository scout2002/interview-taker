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

export const hr_interview_response_schema = {
  description:
    "HR interview response structure, including dynamically generated questions, user answers, and completion status.",
  type: SchemaType.OBJECT,
  properties: {
    hr_question_answers_completed: {
      type: SchemaType.ARRAY,
      description:
        "List of HR questions asked along with corresponding user responses.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          hr_question: {
            type: SchemaType.STRING,
            description: "The HR question generated for the candidate.",
          },
          user_answer: {
            type: SchemaType.STRING,
            description:
              "The candidate's response to the respective HR question.",
          },
        },
        required: ["hr_question", "user_answer"],
      },
    },
    agent_message: {
      type: SchemaType.STRING,
      description: "The next HR question to be asked to the candidate.",
    },
    is_hr_questions_completed: {
      type: SchemaType.BOOLEAN,
      description:
        "Indicates whether the HR interview question round is complete.",
    },
  },
  required: [
    "hr_question_answers_completed",
    "agent_message",
    "is_hr_questions_completed",
  ],
};

export const hr_interview_evaluation_schema = {
  description:
    "HR interview response structure, evaluates HR questions and answers",
  type: SchemaType.OBJECT,
  properties: {
    is_hr_evaluation_pass: {
      type: SchemaType.BOOLEAN,
      description: "Indicates whether the HR interview round is passed.",
    },
  },
  required: ["is_hr_evaluation_pass"],
};

export const tech_round_one_interview_response_schema = {
  description:
    "Technical Round One interview response structure, including dynamically generated questions, candidate answers, and completion status.",
  type: SchemaType.OBJECT,
  properties: {
    tech_round_one_data: {
      type: SchemaType.ARRAY,
      description:
        "List of technical interview questions asked along with the candidate's responses.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          tech_question: {
            type: SchemaType.STRING,
            description:
              "A dynamically generated technical interview question.",
          },
          user_answer: {
            type: SchemaType.STRING,
            description: "The candidate's response to the respective question.",
          },
        },
        required: ["tech_question", "user_answer"],
      },
    },
    agent_message: {
      type: SchemaType.STRING,
      description:
        "The next technical question to be presented to the candidate.",
    },
    tech_round_one_complete: {
      type: SchemaType.BOOLEAN,
      description:
        "Indicates whether the Technical Round One interview is complete.",
    },
  },
  required: ["tech_round_one_data", "agent_message", "tech_round_one_complete"],
};

export const tech_round_two_interview_response_schema = {
  description:
    "Technical Round two interview response structure, including dynamically generated questions, candidate answers, and completion status.",
  type: SchemaType.OBJECT,
  properties: {
    tech_round_two_data: {
      type: SchemaType.ARRAY,
      description:
        "List of technical interview questions asked along with the candidate's responses.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          tech_question: {
            type: SchemaType.STRING,
            description:
              "A dynamically generated technical interview question.",
          },
          user_answer: {
            type: SchemaType.STRING,
            description: "The candidate's response to the respective question.",
          },
        },
        required: ["tech_question", "user_answer"],
      },
    },
    agent_message: {
      type: SchemaType.STRING,
      description:
        "The next technical question to be presented to the candidate.",
    },
    tech_round_two_complete: {
      type: SchemaType.BOOLEAN,
      description:
        "Indicates whether the Technical Round One interview is complete.",
    },
  },
  required: ["tech_round_two_data", "agent_message", "tech_round_two_complete"],
};
