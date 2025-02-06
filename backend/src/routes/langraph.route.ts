import { Router } from "express";
import { upload } from "../utils/multer";
import {
  startConversatioController,
  uploadResumeConstroller,
} from "./../controllers/langraph.controller";

const router = Router();

router.post("/start_conversation", startConversatioController);

router.post("/upload-resume", uploadResumeConstroller);

export default router;
