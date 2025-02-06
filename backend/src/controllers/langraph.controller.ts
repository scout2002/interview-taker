import { RequestHandler } from "express";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { groqmodel } from "../utils/groq.service";
import { DynamicTool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";
import builder from "../agents/workflow/workflow";
import path from "path";
import fs from "fs";
import { saveFile } from "../utils/savefile";

const mongo_client = new MongoClient(process.env.MONGO_URI as string);

export const uploadResumeController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No resume file uploaded" });
      return;
    }

    const { thread_id } = req.params;
    const uploadDirectory = path.join(process.cwd(), "src", "uploads");

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
    }

    const uploadedFilePath = saveFile(
      req.file.path,
      uploadDirectory,
      thread_id
    );

    res.status(200).json({
      message: "Resume uploaded successfully.",
      filePath: uploadedFilePath,
    });
  } catch (error) {
    next(error);
  }
};

export const startConversatioController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const thread_id = uuidv4();
    const checkpointer = new MongoDBSaver({
      client: mongo_client,
      dbName: "interview-taker",
    });
    const graph = builder.compile({
      checkpointer,
      interruptBefore: ["human_resume_submit_feedback"],
    });
    const stream = await graph.stream(
      {
        agent_message: ["hello"],
        thread_id: thread_id,
      },
      {
        configurable: {
          thread_id: thread_id,
        },
      }
    );

    for await (const value of stream) {
      console.log("---STEP---");
      console.log(value);
      console.log("---END STEP---");
    }
  } catch (error) {
    next(error);
  }
};

export const resumeConversatioController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { thread_id, next_state } = req.params;
  } catch (error) {
    next(error);
  }
};
