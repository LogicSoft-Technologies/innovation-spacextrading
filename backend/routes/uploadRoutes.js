// uploadRoutes
import express from "express";
import multer from "multer";
import { protect } from "../middlewares/userAuthMiddleware.js";
import { uploadProfilePhoto } from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/profile/photo", protect, upload.single("profilePhoto"), uploadProfilePhoto);

export default router;
