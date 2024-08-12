const multer = require("multer");
const path = require("path");

// 이미지 저장 경로와 파일 이름 설정
const thumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/thumbnails/"); // 썸네일 이미지를 저장할 경로
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
  },
});

const detailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/details/"); // 상세 이미지를 저장할 경로
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름 설정
  },
});

// 파일 필터 (선택사항)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload an image."), false);
  }
};

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter: fileFilter,
});

const detailUpload = multer({
  storage: detailStorage,
  fileFilter: fileFilter,
});

module.exports = { thumbnailUpload, detailUpload };
