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
