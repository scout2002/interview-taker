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
    const workflow = builder.compile({
      checkpointer,
      interruptBefore: ["human_resume_submit_feedback"],
    });
    const thread = {
      configurable: {
        thread_id: thread_id,
      },
    };
    const graph = await workflow.stream(
      {
        agent_message: ["hello"],
        thread_id: thread_id,
      },
      thread
    );
    for await (const value of graph) {
      let agent_message = value.start_interview?.agent_message;
      let next_state = value?.start_interview?.next_state;
      res.status(200).json({ thread_id, agent_message, next_state });
      return;
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
    const { user_message } = req.body;
    const checkpointer = new MongoDBSaver({
      client: mongo_client,
      dbName: "interview-taker",
    });
    const workflow = builder.compile({
      checkpointer,
      interruptBefore: ["human_resume_submit_feedback"],
    });
    const thread = {
      configurable: {
        thread_id: thread_id,
      },
    };
    if (next_state === "human_resume_submit_feedback") {
      const uploadDirectory = path.join(process.cwd(), "src", "uploads");
      const resumeFilePath = path.join(uploadDirectory, `${thread_id}.pdf`);
      console.log(resumeFilePath);
      if (!fs.existsSync(resumeFilePath)) {
        throw new Error("Resume file not found.");
      }
      await workflow.updateState(
        thread,
        {
          resume_upload_path: resumeFilePath,
          next_state: next_state,
        },
        "human_resume_submit_feedback"
      );
    }
    const stream = await workflow.stream(null, thread);
    for await (const value of stream) {
      console.log(value);
    }
    let agentMessage = "";
    let userMessage = "";
    let nextState = "";
    let threadId = "";

    let threadInfo = await workflow.getState(thread);
    agentMessage = threadInfo.values.agent_message.at(-1) || "none";
    userMessage = threadInfo.values.user_message.at(-1) || "none";
    nextState = threadInfo.next[0];
    threadId = threadInfo.values.thread_id;
    res.status(200).json({
      thread_id: threadId,
      agent_message: agentMessage,
      next_state: nextState,
      user_message: userMessage,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getCurrentThreadState: RequestHandler = async (req, res, next) => {
  try {
    const { thread_id } = req.params;
    const checkpointer = new MongoDBSaver({
      client: mongo_client,
      dbName: "interview-taker",
    });
    const workflow = builder.compile({
      checkpointer,
      interruptBefore: ["human_resume_submit_feedback"],
      interruptAfter: ["resume_evaluator"],
    });
    const thread = {
      configurable: {
        thread_id: thread_id,
      },
    };

    const stream = await workflow.getState(thread);
    res.status(200).send(stream);
    return;
  } catch (error) {
    next(error);
  }
};
