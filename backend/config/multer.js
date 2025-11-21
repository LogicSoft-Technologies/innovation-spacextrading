// multer.js
import express from "express";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { uploadProfilePhoto } from "../controllers/userController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/profile/photo", protect, upload.single("profilePhoto"), uploadProfilePhoto);

export default router;
