import multer from "multer";

const storage = multer.memoryStorage();

export const uploadRoomImages = multer({ storage }).fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

export default uploadRoomImages;