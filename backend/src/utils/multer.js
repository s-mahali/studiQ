import multer from "multer";


//configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 mb limit
  },
  fileFilter: (req, file, cb) => {
    //accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("only image files are allowed"), false);
    }
  },
});