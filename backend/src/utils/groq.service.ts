import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

export const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-70b-8192",
  temperature: 0,
});
