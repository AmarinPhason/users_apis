import multer from "multer";
// เพิ่มการตรวจสอบประเภทไฟล์
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed."
      ),
      false
    );
  }
};
export const singleUpload = multer({ storage, fileFilter }).single("image");
