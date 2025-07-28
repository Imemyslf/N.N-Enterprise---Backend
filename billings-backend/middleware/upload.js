
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";

const dirPDF = path.join(os.homedir(), "Downloads", "Invoice");

if (!fs.existsSync(dirPDF)) {
  fs.mkdirSync(dirPDF, { recursive: true });
  console.log("Invoice directory created successfully at", dirPDF);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirPDF);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, file.originalname + ext);
  },
});

export const upload = multer({ storage });

