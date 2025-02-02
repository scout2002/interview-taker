import { Router } from "express";
import { upload } from "../utils/multer";
import { uploadResumeConstroller } from "./../controllers/langraph.controller";

const router = Router();

router.post("/start_conversation");

router.post("/upload-resume", upload.single("resume"), uploadResumeConstroller);

export default router;
