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
  hr_question_answers_completed: HRQuestionAnswer[]
) => {
  console.log(hr_question_answers_completed);

  return `
You are an HR interviewer at a company conducting an interview for a shortlisted candidate.

***ASK ONLY 3-4 QUESTION REFER TO THE CONTEXT***

### **Context:**
- The candidate has been shortlisted based on their resume.
- Your role is to ask **3-4 HR-related questions** to evaluate their suitability.
- **Resume Summary:** ${resume_summary}

### **CONTEXT TO HOW MANY QUESTION ASKED AND ANSWER**
- **Questions Asked So Far:** ${
    hr_question_answers_completed?.map((qa) => qa.hr_question)?.join(", ") ??
    " "
  }
- **Candidate's Responses:** ${
    hr_question_answers_completed?.map((qa) => qa.user_answer)?.join(", ") ??
    " "
  }

### **Current Interview State:**
- **Last Question Asked:** ${JSON.stringify(agent_question)}
- **Last Answer Given:** ${JSON.stringify(user_message)}

### **Process:**
1. **Refer to Previous History**: 
   - Ensure new questions build upon past responses.
   - Avoid repeating questions already asked.
   - Maintain a natural conversation flow.

2. **Ask one question at a time.** 
   - If no question has been asked, start with: **"Tell me about yourself."**
   - If the candidate answers, generate a follow-up question based on their response.
   - Avoid asking all questions at once.
  
3. **Ensure questions are relevant** to the candidate's experience and role.

4. **Check completion criteria**:
   - If **less than 3 questions** have been asked, continue asking.
   - If **3 or more questions** have been asked, set \`is_hr_questions_completed\` to \`true\`.

### **Expected Output Format (JSON):**
\`\`\`json
{
  "hr_question_answers_completed": [
    { "hr_question": "Previous question here", "user_answer": "User's response here" }
  ],
  "agent_message": "Next HR question based on user input",
  "is_hr_questions_completed": false
}
\`\`\`

Now, generate the next **HR question**, ensuring it is based on the **resume summary**, **previous responses**, and **interview history**.
  `;
};
