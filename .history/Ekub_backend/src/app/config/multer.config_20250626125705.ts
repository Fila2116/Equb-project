import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import AppError from "../shared/errors/app.error";

// 1. Define types for better type safety
type MulterFile = Express.Multer.File;
type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

// 2. Keep your original constants exactly as they were
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

// 3. Corrected multerConfig function with proper typing
export const multerConfig = (
  resource: string,
  destination: string,
  filter: typeof FILTERS.IMAGE
) => {
  const storage = multer.diskStorage({
    destination: function (req: Request, file: MulterFile, cb: DestinationCallback) {
      try {
        cb(null, path.join(__dirname, destination));
      } catch (err) {
        cb(new Error("Invalid file destination"), '');
      }
    },
    filename: function (req: Request, file: MulterFile, cb: FileNameCallback) {
      try {
        const fileName = FILENAME[resource](file.originalname);
        req.body.fileName = fileName;
        cb(null, fileName);
      } catch (err) {
        cb(new Error("Failed to generate filename"), '');
      }
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 5, // 5MB
      fieldSize: 1024 * 1024 * 10, // 10MB
    },
    fileFilter: function (req: Request, file: MulterFile, cb: FileFilterCallback) {
      try {
        if (filter.CONTENT.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError(filter.MESSAGE, 400));
        }
      } catch (err) {
        cb(new AppError("File filter error", 500));
      }
    },
  });
};