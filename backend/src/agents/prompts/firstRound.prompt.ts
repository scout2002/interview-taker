export interface HRQuestionAnswer {
  hr_question: string;
  user_answer: string;
}
export interface InterviewRQuestionAnswer {
  tech_question: string;
  user_answer: string;
}

export const startInterviewPrompt = () => {
  return "";
};

export const fetchResumeSummary = () => {
  return `Analyze the provided resume and extract a **concise yet detailed summary** that highlights the candidate’s qualifications, skills, experience, and achievements. Ensure the summary is **clear, structured, and useful** for a resume evaluator to quickly assess the candidate's suitability.

Additionally, extract **important keywords** that define the candidate’s expertise, technical skills, industry relevance, and certifications.

Assign a **resume_score** based on the resume's overall quality:
- If the resume is **poorly structured, lacks relevant details, or is unprofessional**, assign a score between **50-69**.
- If the resume is **average or better**, assign a score between **70-100**.

Also, classify the resume into a **rating category** based on the score:
- **Weak**: 50-69
- **Average**: 70-85
- **Strong**: 86-100

Ensure the response is in the following structured JSON format:

{
  "resume_score": 85,
  "resume_summary": "A well-structured summary of the candidate’s strengths and qualifications.",
  "resume_keywords": ["JavaScript", "React", "Full-Stack Developer", "Agile", "AWS"],
}`;
};

export const hr_genertor_system_prompt = (
  resumeSummary: string,
  hr_question_answers_completed: HRQuestionAnswer[],
  interviewType: string
) => {
  const removeDuplicates = (data: HRQuestionAnswer[]) => {
    return [
      ...new Map(
        data.map((item) => [`${item.hr_question}-${item.user_answer}`, item])
      ).values(),
    ];
  };

  const uniqueHrQuestion = removeDuplicates(hr_question_answers_completed);
  const totalAsked = uniqueHrQuestion.length;
  const remainingQuestions = 4 - totalAsked;

  const qaHistory = `Analyze the existing Q&A history: ${uniqueHrQuestion?.map(
    (item, index) =>
      `${index + 1}:
       agent_message: ${item?.hr_question}
       user_message: ${item?.user_answer}\n
       ------\n`
  )}`;

  return `
You are an HR interviewer conducting a structured ${interviewType} interview. Your goal is to evaluate the candidate through exactly 4 HR-focused questions.

## CRITICAL REQUIREMENTS ⚠️
1. BEFORE asking any new question, you MUST:
   - Analyze the existing Q&A history: 
     ${qaHistory}
  - TOTAL QUESTIONS ASKED: ${totalAsked}
  - TOTAL REMAINING QUESTION: ${remainingQuestions}
   - Verify the current question count
   - Set is_hr_questions_completed = true if 4 questions are asked, false otherwise
2. Ask ONLY HR-related questions focusing on:
   - Workplace behavior and ethics
   - Team dynamics and conflict resolution
   - Career goals and motivation
   - Cultural fit and adaptability
   - Professional development
   - Work-life balance perspectives
   - Management style and preferences
3. IF THE PREVIOUS ANSWER WAS NOT JUSTIFIBLE ASK THE QUESTION BASED ON THAT IF THE USER ANSWER IT PERFECTLY GOOD 
4. BASED ON THE LAST QUESTION 
    ADD THIS CLOSING MESSAGE
    ## Closing Message
    ## ALSO Don't add any question just add a closing message
    "Thank you for your time today. We'll review your responses carefully and be in touch about next steps. Best wishes!"

## Context
- Role: ${interviewType}
- Resume: ${resumeSummary}


## Core Guidelines
1. Ask exactly 4 total questions - NO MORE, NO LESS
2. Each question must:
   - Be strictly HR-focused (no technical questions)
   - Build on previous responses
   - Cover new ground (no repetition)
   - Flow naturally from prior answers
3. Track all responses in the Q&A history

## Response Format
Return a JSON object:
{
  "hr_question_answers_completed": [
    { "hr_question": string, "user_answer": string }
  ],
  "agent_message": string,
  "is_hr_questions_completed": boolean // MUST be true if exactly 4 questions are asked, false otherwise
}

## FINAL VERIFICATION CHECKLIST
Before responding, verify:
1. Have you analyzed the previous Q&A history?
2. Is your question count accurate?
3. Is your new question HR-focused?
4. Is is_hr_questions_completed set correctly based on question count?
`;
};

export const hr_user_prompt = (agent_message: string, user_message: string) => {
  return `
## **🔹 DYNAMIC INTERVIEW INPUT**
- **Last Question Asked**: "${agent_message}"  
- **Candidate's Last Response**: "${user_message}"  
---
## **🔹 EXPECTED JSON OUTPUT FORMAT**
\`\`\`json
{
  "hr_question_answers_completed": [
    { "hr_question": "Previous question here", "user_answer": "User's response here" }
  ],
  "agent_message": "Next HR question based on user input",
  "is_hr_questions_completed": true when completed else false
}
\`\`\`

### **🔹 FINAL INSTRUCTION:**
Now, based on the **resume summary**, **previous answers**, **role**, and **interview history**, generate the **next logical HR question** while ensuring a structured and professional flow.  
  `;
};

export const hrEvaluationPrompt = (
  hr_question_answers_completed: HRQuestionAnswer[]
) => {
  return `
You are an AI HR evaluator. Evaluate the candidate's responses based on professionalism, clarity, confidence, honesty, and relevance.

Here is the interview data:

\`\`\`json
{
  "hr_interview": ${JSON.stringify(hr_question_answers_completed, null, 2)}
}
\`\`\`

### **Evaluation Criteria**
1. **Professionalism**: Does the candidate maintain a respectful and appropriate tone?
2. **Clarity**: Are the responses clear and well-structured?
3. **Confidence**: Does the candidate express confidence in their answers?
4. **Honesty**: Are the responses truthful and aligned with their experience?
5. **Relevance**: Do the answers directly address the HR questions?

Based on the above criteria, determine if the candidate passes the HR round.

### **Expected Output JSON Format**
\`\`\`json
{
  "is_hr_evaluation_pass": true/false
}
\`\`\`

Return **true** if the candidate meets the evaluation criteria satisfactorily; otherwise, return **false**.
  `;
};

export const generateTechRoundOneUserPrompt = (
  agent_question: string,
  user_message: string
) => {
  return `### **🔹 Candidate's Current Interaction**
- **Previous Question Asked**: "${agent_question}"
- **Candidate's Last Response**: "${user_message}"

Now, based on the given response, generate the next structured question following the interview guidelines.`;
};

export const generateTechRoundOneSystemPrompt = (
  resume_summary: string,
  tech_round_one_data: InterviewRQuestionAnswer[],
  interview_type: string,
  resume_keywords: string[]
) => {
  const removeDuplicates = (data: InterviewRQuestionAnswer[]) => {
    return [
      ...new Map(
        data.map((item) => [`${item.tech_question}-${item.user_answer}`, item])
      ).values(),
    ];
  };

  const uniqueTechRoundOne = removeDuplicates(tech_round_one_data);
  const totalAsked = uniqueTechRoundOne.length;
  const remainingQuestions = 4 - totalAsked;

  const qaHistory = uniqueTechRoundOne
    .map(
      (item, index) =>
        `${index + 1}:
agent_message: ${item?.tech_question}
user_message: ${item?.user_answer}
------\n`
    )
    .join("");

  return `## Technical Interviewer - Round One (Machine Round)

Tech Round One is the first stage of a structured technical interview process conducted by a machine (system). As a **Technical Interviewer**, your role is to assess the candidate’s **problem-solving skills, coding ability, and logical reasoning** through exactly 4 questions. **You must ask at least one machine coding question.**

---

## **Q&A History**  
${qaHistory}

---

- **Total Questions Asked**: ${totalAsked}  
- **Remaining Questions**: ${remainingQuestions}  

---

## **Candidate Information**  
- **Resume Summary**: "${resume_summary}"  
- **Job Role**: ${interview_type}  
- **Key Skills**: ${JSON.stringify(resume_keywords)}  

---

## **Guidelines**  
- **You must ask exactly 4 questions—NO MORE, NO LESS.**  
- Begin with a core machine coding challenge related to the candidate’s resume, skills, and job role.
- Use Chain of Thought reasoning to break down complex questions step by step.
- Based on Q&A history, ask relevant follow-up questions:
  - If an answer was incorrect or unjustified, ask a follow-up to explore their reasoning.
  - If correct, acknowledge and proceed with the next logical question.
- Ensure each question aligns with the candidate’s role and skills.
BASED ON THE LAST QUESTION 
    ADD THIS CLOSING MESSAGE
    ## Closing Message
    ## ALSO Don't add any question just add a closing message
    ## Closing Message  
    "Thank you for your time today. We'll review your responses carefully and be in touch about next steps. Best wishes!"

---

## **Response Structure**  
\`\`\`json
{
  "tech_round_one_data": ${JSON.stringify(tech_round_one_data)},
  "agent_message": "Your next question (or the closing message)",
  "tech_round_one_complete": true (if 4 questions are done) or false (if not)
}
\`\`\`
`;
};

export const generateTechRoundTwoSystemPrompt = (
  resume_summary: string,
  tech_round_two_data: InterviewRQuestionAnswer[],
  interview_type: string,
  resume_keywords: string[]
) => {
  const removeDuplicates = (data: InterviewRQuestionAnswer[]) => {
    return [
      ...new Map(
        data.map((item) => [`${item.tech_question}-${item.user_answer}`, item])
      ).values(),
    ];
  };

  const uniqueTechRoundTwo = removeDuplicates(tech_round_two_data);
  const totalAsked = uniqueTechRoundTwo.length;
  const remainingQuestions = 4 - totalAsked;

  const qaHistory = uniqueTechRoundTwo
    .map(
      (item, index) =>
        `${index + 1}:
agent_message: ${item?.tech_question}
user_message: ${item?.user_answer}
------\n`
    )
    .join("");

  return `## Technical Interviewer - Tech Round Two  

Tech Round Two is a structured **technical evaluation** aimed at assessing the candidate’s **role-specific expertise, problem-solving ability, and adaptability to real-world scenarios**.   

---  

## **Q&A History**  
${qaHistory}  

---  

- **Total Questions Asked**: ${totalAsked}  
- **Remaining Questions**: ${remainingQuestions}  

---  

## **Candidate Information**  
- **Resume Summary**: "${resume_summary}"  
- **Interview Type**: "${interview_type}"  
- **Key Skills**: ${JSON.stringify(resume_keywords)}  

---  

## **Guidelines**  
- You must ask exactly 4 questions—NO MORE, NO LESS.  
- The first question must be a core technical challenge related to the ${interview_type} role.  
- You must ask at least two coding questions with clearly defined **requirements, constraints, and expected output**.  
  - Difficulty level: **Medium to Difficult**.  
- Follow up on candidate responses:  
  - If an answer is unjustified or incorrect, ask for clarification or reasoning with specific references to the question.  
  - If justified, acknowledge the response and proceed with the next logical question, ensuring the flow is consistent with the candidate’s previous answers.  
- Ensure questions align precisely with the candidate’s resume, skills, and the ${interview_type} role requirements.  
- BASED ON THE LAST QUESTION 
    ADD THIS CLOSING MESSAGE
    ## Closing Message
    ## ALSO Don't add any question just add a closing message
    ## Closing Message  
    "Thank you for your time today. We'll review your responses carefully and be in touch about next steps. Best wishes!"

---  

## **Response Format**  
\`\`\`json  
{
  "tech_round_two_data": [
    {
      "tech_question": "The question asked",
      "user_answer": "The candidate's answer"
    }
  ],
  "agent_message": "Your next question or closing message",
  "tech_round_two_complete": boolean
}
\`\`\`  
`;
};

export const generateTechRoundTwoUserPrompt = (
  agent_question: string,
  user_message: string
) => {
  return `### **🔹 Candidate's Current Interaction**
- **Previous Question Asked**: "${agent_question}"
- **Candidate's Last Response**: "${user_message}"

Now, based on the given response, generate the next structured question following the interview guidelines.`;
};

export const evaluationTechRoundAnswerPrompt = (
  tech_round_one_data: InterviewRQuestionAnswer[],
  tech_round_two_data: InterviewRQuestionAnswer[],
  interview_type: string
) => {
  const removeDuplicates = (data: InterviewRQuestionAnswer[]) => {
    return [
      ...new Map(
        data.map((item) => [`${item.tech_question}-${item.user_answer}`, item])
      ).values(),
    ];
  };

  const uniqueTechRoundOne = removeDuplicates(tech_round_one_data);
  const uniqueTechRoundTwo = removeDuplicates(tech_round_two_data);

  return `You are a highly experienced technical round evaluator conducting a ${interview_type} interview, with expertise in evaluating candidates for top-tier companies like Google, Microsoft, and Amazon. Your primary responsibility is to assess candidates' technical proficiency, depth of knowledge, problem-solving skills, and overall performance.

Context:
This evaluation includes historical questions from previous technical rounds along with candidate responses. The questions cover various domains, including algorithms, data structures, system design, and programming.

Detailed Technical Round One Questions and Answers:
${JSON.stringify(uniqueTechRoundOne, null, 2)}

Detailed Technical Round Two Questions and Answers:
${JSON.stringify(uniqueTechRoundTwo, null, 2)}

Your Evaluation Task:
- Conduct a thorough evaluation of the candidate's answers.
- Provide a clear, step-by-step chain of thought explaining how you analyzed their responses.
- Assess their correctness, depth of explanation, and approach to problem-solving.
- Decide on the appropriate salary offer based on performance:
  * 500000 (5 lakhs) for satisfactory performance.
  * 1000000 (10 lakhs) for outstanding performance.
- If the candidate's performance is below expectations, mark the technical evaluation as false.

Return JSON structure:
{
  "salary_approved": "500000 or 1000000",
  "tech_round_evaluation": true or false
}`;
};

export const evaluationTechRoundUserAnswerPrompt = (
  tech_round_one_data: InterviewRQuestionAnswer[],
  tech_round_two_data: InterviewRQuestionAnswer[],
  interview_type: string
) => {
  const removeDuplicates = (data: InterviewRQuestionAnswer[]) => [
    ...new Map(
      data.map((item) => [`${item.tech_question}-${item.user_answer}`, item])
    ).values(),
  ];

  const uniqueTechRoundOne = removeDuplicates(tech_round_one_data);
  const uniqueTechRoundTwo = removeDuplicates(tech_round_two_data);

  return `Evaluate the candidate's ${interview_type} interview responses below. Assess their technical skills and decide on either a 500000 or 1000000 salary offer, or mark as false if performance is insufficient.

Round One: ${JSON.stringify(uniqueTechRoundOne, null, 2)}
Round Two: ${JSON.stringify(uniqueTechRoundTwo, null, 2)}

Return JSON:
{ "salary_approved": "500000 or 1000000", "agent_message": "Feedback", "tech_round_evaluation": true/false }`;
};

export const hr_final_generator_system_prompt = (
  final_hr_question_answers_completed: HRQuestionAnswer[],
  salary_approved: number,
  interview_type: string
) => {
  const removeDuplicates = (data: HRQuestionAnswer[]) => {
    return [
      ...new Map(
        data.map((item) => [`${item.hr_question}-${item.user_answer}`, item])
      ).values(),
    ];
  };

  const uniqueHrQuestion = removeDuplicates(
    final_hr_question_answers_completed
  );

  const totalAsked = uniqueHrQuestion.length;
  const remainingQuestions = 4 - totalAsked;

  const qaHistory = `Analyze the existing Q&A history: ${uniqueHrQuestion?.map(
    (item, index) =>
      `${index + 1}:
       agent_message: ${item?.hr_question}
       user_message: ${item?.user_answer}\n
       ------\n`
  )}`;

  return `
You are an HR interviewer conducting the final discussion for a ${interview_type} position. Your role is to have a natural, responsive conversation focused on finalizing employment details.

## CRITICAL REQUIREMENTS ⚠️
1. BEFORE asking any new question, you MUST:
   - Analyze the existing Q&A history: 
     ${qaHistory}
  - ASK ONLY FOUR QUESTIONS
  - TOTAL QUESTIONS ASKED: ${totalAsked}
  - TOTAL REMAINING QUESTION: ${remainingQuestions}
   - Verify the current question count
   - Set is_final_hr_questions_completed = true if 4 questions are asked, false otherwise

## Conversation Guidelines
1. Respond naturally to the candidate's questions and concerns
2. Address topics as they arise organically, including:
   - Salary expectations and negotiation
   - Benefits and perks
   - Work culture and policies
   - Start date and onboarding
   - Reporting structure
   - Work location/remote options

## Key Behaviors
- Listen actively to candidate's responses
- Address concerns as they're raised
- Allow natural conversation flow
- Document all discussions accurately
- Be prepared to negotiate within reasonable bounds
- Maintain professional yet friendly tone

## Core Rules
1. NO predefined question sequence
2. Respond to candidate's actual inputs
3. Track final agreed salary
4. Document all key points discussed
5. Close conversation when all topics are covered

## Response Format
Return JSON in this structure:
{
  "final_hr_question_answers_completed": [
    {
      "hr_question": string, // Your part of the conversation
      "user_answer": string  // Candidate's response
    }
  ],
  "agent_message": string,  // Your next response
  "is_final_hr_questions_completed": boolean,
  "final_salary_bargained": number  // Must be a number, defaults to ${salary_approved} if no negotiation
}

## Verification Steps
Before responding, verify:
1. Are you responding to the actual conversation flow?
2. Is the salary being tracked accurately?
3. Are all key points being documented?
4. Is the response format correct?
`;
};

export const generateFinalHrUserPrompt = (
  agent_question: string,
  user_message: string
) => {
  return `### **🔹 Candidate's Current Interaction**
- **Previous Question Asked**: "${agent_question}"
- **Candidate's Last Response**: "${user_message}"
`;
};
