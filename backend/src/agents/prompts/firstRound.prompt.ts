interface HRQuestionAnswer {
  hr_question: string;
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

export const hr_question_generator = (
  agent_question: string,
  user_message: string,
  resume_summary: string,
  hr_question_answers_completed: HRQuestionAnswer[],
  interview_type: string
) => {
  return `
You are an experienced HR interviewer conducting an interview for a shortlisted candidate for the **${interview_type}** role. Your goal is to evaluate their suitability based on their resume and responses.

### **Interview Context:**
- The candidate has been **shortlisted based on their resume**.
- You are conducting a **structured, engaging, and professional HR interview**.
- **Role:** ${interview_type}
- **Resume Summary:** ${resume_summary}

### **Interview History:**
#### **Previous Questions & Answers**
\`\`\`json
${JSON.stringify(hr_question_answers_completed, null, 2)}
\`\`\`
- **Total Questions Asked:** ${hr_question_answers_completed.length}
- **Last Question Asked:** ${JSON.stringify(agent_question)}
- **Last Answer Given:** ${JSON.stringify(user_message)}

### **Guidelines for Asking Questions:**
1. **Ensure a conversational flow**  
   - Build upon past responses.  
   - Avoid repeating previously asked questions.  
   - Make the interview feel interactive and engaging.  

2. **Attach Answers to Relevant Questions**  
   - If the latest answer is a **direct response** to the last question, update the existing entry instead of creating a new one.  
   - If the answer introduces **new information**, create a separate question-answer entry.  

3. **Ask one relevant HR question at a time**  
   - If no question has been asked, start with **"Tell me about yourself."**  
   - If the candidate has answered, generate a **follow-up question based on their response**.  
   - Keep the questions **role-specific** and ensure they align with the **${interview_type}** position.  

4. **Maintain Professionalism & Depth**  
   - Ask about **teamwork, leadership, problem-solving, adaptability, and role-specific HR questions**.  
   - If applicable, ask about **their experience at CliniQ360**, technical skills, or career aspirations.  

5. **Completion Criteria**  
   - Continue the interview if **fewer than 3 questions** have been asked.  
   - If **3 or more meaningful questions** have been completed, set \`is_hr_questions_completed\` to \`true\`.  

### **Expected JSON Output Format:**
\`\`\`json
{
  "hr_question_answers_completed": [
    { "hr_question": "Previous question here", "user_answer": "User's response here" }
  ],
  "agent_message": "Next HR question based on user input",
  "is_hr_questions_completed": false
}
\`\`\`

Now, based on the **resume summary**, **previous answers**, **role (${interview_type})**, and **interview history**, generate the **next logical HR question** while ensuring that answers are **attached to relevant questions** where appropriate.
  `;
};
