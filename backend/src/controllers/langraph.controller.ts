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
import { InterviewType } from "../agents/workflow/state_schema";

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
      interruptBefore: [
        "human_resume_submit_feedback",
        "human_select_interview_type",
        "human_hr_filter_feedback",
        "welcome_hr_section",
        "welcome_tech_round_one",
        "human_tech_round_one_feedback",
        "welcome_tech_round_two",
        "human_tech_round_two_feedback",
        "init_final_hr_round",
        "human_final_hr_round_feedback",
        "welcome_tech_round_two",
        "human_final_hr_round_feedback",
      ],
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
    let newAgentMessage = "";
    let newUserMessage = "";
    for await (const value of graph) {
      newAgentMessage = value.start_interview?.agent_message;
      newUserMessage = value?.start_interview?.next_state;
    }
    let nextState = "";
    let threadId = "";
    let threadInfo = await workflow.getState(thread);
    newAgentMessage = threadInfo.values.agent_message.at(-1) || "none";
    newUserMessage = threadInfo.values.user_message.at(-1) || "none";
    nextState = threadInfo.next[0];
    threadId = threadInfo.values.thread_id;
    res.status(200).json({
      thread_id: threadId,
      agent_message: newAgentMessage,
      next_state: nextState,
      user_message: newUserMessage,
    });
    return;
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
    const { thread_id, next_state, interview_type } = req.params;
    const { userMessage } = req.body;
    const checkpointer = new MongoDBSaver({
      client: mongo_client,
      dbName: "interview-taker",
    });
    const workflow = builder.compile({
      checkpointer,
      interruptBefore: [
        "human_resume_submit_feedback",
        "human_select_interview_type",
        "human_hr_filter_feedback",
        "welcome_hr_section",
        "welcome_tech_round_one",
        "human_tech_round_one_feedback",
        "welcome_tech_round_two",
        "human_final_hr_round_feedback",
      ],
      interruptAfter: ["evaluate_tech_round"],
    });
    const thread = {
      configurable: {
        thread_id: thread_id,
      },
    };
    if (next_state === "human_select_interview_type") {
      console.log("Entered in human Select Process");

      if (!(interview_type in InterviewType)) {
        console.log("interview_type");

        throw new Error("Invalid interview type");
      }
      await workflow.updateState(
        thread,
        {
          interview_type: interview_type,
        },
        "human_select_interview_type"
      );
    } else if (next_state === "human_resume_submit_feedback") {
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
    } else if (next_state === "welcome_hr_section") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: ["Hi"],
        },
        "welcome_hr_section"
      );
    } else if (next_state === "human_hr_filter_feedback") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: [userMessage],
        },
        "human_hr_filter_feedback"
      );
    } else if (next_state === "welcome_tech_round_one") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: ["Hi"],
        },
        "welcome_tech_round_one"
      );
    } else if (next_state === "human_tech_round_one_feedback") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: [userMessage],
        },
        "human_tech_round_one_feedback"
      );
    } else if (next_state === "welcome_tech_round_two") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: ["Hi"],
        },
        "welcome_tech_round_two"
      );
    } else if (next_state === "human_tech_round_two_feedback") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: [userMessage],
        },
        "human_tech_round_two_feedback"
      );
    } else if (next_state === "evaluate_tech_round") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
        },
        "evaluate_tech_round"
      );
    } else if (next_state === "init_final_hr_round") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: ["Hi"],
        },
        "init_final_hr_round"
      );
    } else if (next_state === "human_final_hr_round_feedback") {
      await workflow.updateState(
        thread,
        {
          next_state: next_state,
          user_message: [userMessage],
        },
        "human_final_hr_round_feedback"
      );
    }
    let newAgentMessage = "";
    let newUserMessage = "";
    const graph = await workflow.stream(null, thread);
    for await (const value of graph) {
      newAgentMessage = value.start_interview?.agent_message;
      newUserMessage = value?.start_interview?.user_message;
    }
    let nextState = "";
    let threadId = "";
    let threadInfo = await workflow.getState(thread);
    newAgentMessage = threadInfo.values.agent_message.at(-1) || "none";
    newUserMessage = threadInfo.values.user_message.at(-1) || "none";
    nextState = threadInfo.next[0];
    threadId = threadInfo.values.thread_id;
    res.status(200).json({
      thread_id: threadId,
      agent_message: newAgentMessage,
      next_state: nextState,
      user_message: newUserMessage,
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
      interruptBefore: [
        "human_resume_submit_feedback",
        "human_select_interview_type",
        "human_hr_filter_feedback",
        "welcome_hr_section",
        "welcome_tech_round_one",
        "human_tech_round_one_feedback",
        "welcome_tech_round_two",
        "human_tech_round_two_feedback",
      ],
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
