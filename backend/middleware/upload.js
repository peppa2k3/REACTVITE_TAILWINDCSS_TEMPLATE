import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads/posts");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|wmv|flv|mkv/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage =
    allowedImageTypes.test(extname) && mimetype.startsWith("image/");
  const isVideo =
    allowedVideoTypes.test(extname) && mimetype.startsWith("video/");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// Middleware to process uploaded files and add to req.body
export const processUploadedFiles = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    const media = req.files.map((file) => {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      const url = `/uploads/posts/${file.filename}`;

      return {
        type: fileType,
        url: url,
        thumbnail: fileType === "video" ? url : undefined, // Could generate video thumbnails later
      };
    });

    // Parse existing body if it's JSON string
    if (typeof req.body.data === "string") {
      try {
        const data = JSON.parse(req.body.data);
        req.body = { ...data, media };
      } catch (e) {
        req.body.media = media;
      }
    } else {
      req.body.media = media;
    }
  }
  next();
};

// Combined middleware
const uploadMiddleware = [upload.array("media", 10), processUploadedFiles];

export default upload;
export { uploadMiddleware };
