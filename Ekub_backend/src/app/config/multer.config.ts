import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import AppError from "../shared/errors/app.error";

export const RESOURCES = {
  CATEGORY: "CATEGORY",
  AVATAR: "AVATAR",
  BANNER: "BANNER",
  PAYMENT: "PAYMENT",
  GUARANTEE: "GUARANTEE",
  BRANDING_LIGHT: "BRANDING_LIGHT",
  BRANDING_DARK: "BRANDING_DARK",
};

export const DESTINANTIONS = {
  IMAGE: {
    CATEGORY: "../../../public/images/category",
    AVATAR: "../../../public/images/avatar",
    BANNER: "../../../public/images/banner",
    PAYMENT: "../../../public/images/payment",
    GUARANTEE: "../../../public/images/guarantee",
    BRANDING: "../../../public/images/branding",
  },
};

export const FILENAME: {
  [key: string]: (originalname: string) => string;
} = {
  CATEGORY: (originalname: string) =>
    `category-${uuidv4()}${path.extname(originalname)}`,
  AVATAR: (originalname: string) =>
    `avatar-${uuidv4()}${path.extname(originalname)}`,
  BANNER: (originalname: string) =>
    `banner-${uuidv4()}${path.extname(originalname)}`,
  PAYMENT: (originalname: string) =>
    `payment-${uuidv4()}${path.extname(originalname)}`,
  GUARANTEE: (originalname: string) =>
    `guarantee-${uuidv4()}${path.extname(originalname)}`,
  BRANDING_LIGHT: (originalname: string) =>
    `branding-logo-${uuidv4()}${path.extname(originalname)}`,
  BRANDING_DARK: (originalname: string) =>
    `branding-logo-${uuidv4()}${path.extname(originalname)}`,
};

export const FILTERS = {
  IMAGE: {
    CONTENT: ["image/png", "image/jpg", "image/jpeg"],
    MESSAGE: "Only .png, .jpg and .jpeg format allowed!",
  },
};

export const multerConfig = (
  resource: string,
  destination: string,
  filter: any
) => {
  /**
   * Multer disk storage
   */
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, destination));
    },
    filename: function (req, file, cb) {
      const fileName = FILENAME[resource](file.originalname);
      req.body.fileName = fileName;
      cb(null, fileName);
    },
  });

  /**
   * Multer file upload with filters
   */
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 1024,
      fieldSize: 1024 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
      if (filter.CONTENT.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new AppError(filter.MESSAGE, 400));
      }
    },
  });
  return upload;
};
