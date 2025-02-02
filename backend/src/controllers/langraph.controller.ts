import { RequestHandler } from "express";
import { z } from "zod";

const interviewParamsSchema = z.object({
  next_state: z.string(),
  thread_id: z.string(),
});

export const uploadResumeConstroller: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const validationResult = interviewParamsSchema.safeParse(req.params);

    if (!validationResult.success) {
      const errors = validationResult.error.errors;
      res.status(400).json({
        message: "Invalid parameters",
        errors: errors.map((error) => ({
          path: error.path.join("."),
          message: error.message,
        })),
      });
      return;
    }
    const { next_state, thread_id } = validationResult.data;
  } catch (error) {
    next(error);
  }
};
