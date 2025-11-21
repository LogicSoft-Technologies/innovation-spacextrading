import fs from "fs";
import path from "path";
import multer from "multer";

// Ensure the emails folder exists
const emailUploadPath = path.join("uploads", "emails");
if (!fs.existsSync(emailUploadPath)) {
  fs.mkdirSync(emailUploadPath, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, emailUploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadEmailAttachment = multer({ storage });
