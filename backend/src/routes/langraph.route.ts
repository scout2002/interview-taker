import { Router } from "express";
import { upload } from "../utils/multer";
import {
  getCurrentThreadState,
  resumeConversatioController,
  startConversatioController,
  uploadResumeController,
} from "./../controllers/langraph.controller";

const router = Router();

router.post("/start_conversation", startConversatioController);

router.post(
  "/upload-resume/thread_id=:thread_id",
  upload.single("file"),
  uploadResumeController
);

router.post(
  "/resume_conversation/thread_id=:thread_id&next_state=:next_state&interview_type=:interview_type",
  resumeConversatioController
);

router.post("/get-thread-state/thread_id=:thread_id", getCurrentThreadState);

export default router;
