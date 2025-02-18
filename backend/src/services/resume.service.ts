import fs from "fs";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { RequestHandler } from "express";
import builder from "../agents/workflow/workflow";
import { InterviewType } from "../agents/workflow/state_schema";
import path from "path";

const mongo_client = new MongoClient(process.env.MONGO_URI as string);

export const resumeConversatioController = async (
  thread_id: string,
  next_state: string,
  interview_type: string,
  userMessage: string
) => {
  try {
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
    return {
      sucess: true,
      thread_id: threadId,
      agent_message: newAgentMessage,
      next_state: nextState,
      user_message: newUserMessage,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
