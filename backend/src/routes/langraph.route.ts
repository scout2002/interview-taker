import { Router } from "express";
import { upload } from "../utils/multer";
import {
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

export default router;
