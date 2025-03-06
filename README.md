# Interview Taker AI

**Interview Taker AI** is an automated interview platform built with LangGraph and LangChain using TypeScript. The system conducts multi-stage technical interviews, including resume evaluation, HR screening, and technical assessments.

## 🛠️ Architecture

### Interview Workflow

1. **Resume Submission**

   - User submits resume
   - System evaluates resume (70% threshold to proceed)

2. **HR Screening Round**

   - Automated questions about experience and background
   - Candidate responses evaluated

3. **Technical Round One**

   - Core technical concepts
   - Problem-solving questions

4. **Technical Round Two**

   - Advanced technical questions
   - System design challenges

5. **Final HR Round**

   - Culture fit assessment
   - Compensation discussion
   - Final evaluation

### 🧠 State Management

LangGraph's state machine controls the interview flow with conditional transitions:

- `resume_score > 70` → HR screening
- `is_hr_evaluation_pass` → Technical rounds
- `tech_round_evaluation` → Final HR round

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **AI Models:** Groq (LLaMA3-70B), Google Gemini
- **State Management:** LangGraph
- **Storage:** MongoDB (conversation history)
- **Error Handling:** Custom middleware

## 🚀 Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/scout2002/interview-taker
   cd interview-taker-ai
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Create a `.env` file and add required keys (e.g., MongoDB URI, API keys for Groq and Gemini)

4. Start the development server:

   ```bash
   npm run dev
   ```

## 🔮 Next Steps

- **Speech Integration:** Add speech-to-text and text-to-speech capabilities
- **WebSocket Implementation:** Real-time communication for smoother interview flow
- **Containerization:** Docker setup for easy deployment
- **Scalability:** Horizontal scaling with load balancing
- **Analytics Dashboard:** Visualize interview performance metrics

## 📘 API Endpoints

- **Start Conversation:**

  ```http
  POST /start_conversation
  ```

- **Upload Resume:**

  ```http
  POST /upload-resume/thread_id=:thread_id
  ```

- **Resume Conversation:**

  ```http
  POST /resume_conversation/thread_id=:thread_id&next_state=:next_state&interview_type=:interview_type
  ```

- **Get Current Thread State:**

  ```http
  POST /get-thread-state/thread_id=:thread_id
  ```

Let me know if you’d like me to refine anything or add more sections! 🚀
