import express from "express";
import {
  uploadMiddleware,
  uploadVideo,
  // getVideosByExpression,
  getAllVideos,
  // deleteVideo,
} from "../controllers/videoController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Corrected here

const router = express.Router();

// Route for uploading video (protected by token verification)
router.post("/upload", verifyToken, uploadMiddleware, uploadVideo);

// Route for fetching all videos (protected by token verification)
router.get("/", getAllVideos);


export default router;
