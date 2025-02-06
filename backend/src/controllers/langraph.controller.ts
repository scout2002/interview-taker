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

const mongo_client = new MongoClient(process.env.MONGO_URI as string);

export const uploadResumeConstroller: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // const validationResult = interviewParamsSchema.safeParse(req.params);
    // if (!validationResult.success) {
    //   const errors = validationResult.error.errors;
    //   res.status(400).json({
    //     message: "Invalid parameters",
    //     errors: errors.map((error) => ({
    //       path: error.path.join("."),
    //       message: error.message,
    //     })),
    //   });
    //   return;
    // }
    // const { next_state, thread_id } = validationResult.data;
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
      interruptAfter: ["start_interview"],
    });
    const stream = await graph.stream(
      {
        agent_message: ["hello"],
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
  } catch (error) {
    next(error);
  }
};
