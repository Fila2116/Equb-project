import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import AppError from "../shared/errors/app.error";

// 1. Added type safety for resources
type ResourceType = 
  | "CATEGORY"
  | "AVATAR"
  | "BANNER"
  | "PAYMENT"
  | "GUARANTEE"
  | "BRANDING_LIGHT"
  | "BRANDING_DARK";

// 2. Original RESOURCES object remains exactly the same
export const RESOURCES = {
  CATEGORY: "CATEGORY",
  AVATAR: "AVATAR",
  BANNER: "BANNER",
  PAYMENT: "PAYMENT",
  GUARANTEE: "GUARANTEE",
  BRANDING_LIGHT: "BRANDING_LIGHT",
  BRANDING_DARK: "BRANDING_DARK",
};

// 3. Original DESTINANTIONS structure remains the same (note: kept original spelling)
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

// 4. Enhanced FILENAME with type safety but same functionality
export const FILENAME: {
  [key in ResourceType]: (originalname: string) => string;
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

// 5. Enhanced FILTERS with type safety
interface FileFilterConfig {
  CONTENT: string[];
  MESSAGE: string;
}

export const FILTERS = {
  IMAGE: {
    CONTENT: ["image/png", "image/jpg", "image/jpeg"],
    MESSAGE: "Only .png, .jpg and .jpeg format allowed!",
  } as FileFilterConfig, // Added type annotation
};

// 6. Improved multerConfig function with better error handling
export const multerConfig = (
  resource: ResourceType,
  destination: string,
  filter: FileFilterConfig
) => {
  // Validate resource type
  if (!Object.keys(FILENAME).includes(resource)) {
    throw new Error(`Invalid resource type: ${resource}`);
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Added error handling for destination
      try {
        cb(null, path.join(__dirname, destination));
      } catch (err) {
        cb(new AppError("Invalid file destination", 500), false);
      }
    },
    filename: function (req, file, cb) {
      try {
        const fileName = FILENAME[resource](file.originalname);
        req.body.fileName = fileName;
        cb(null, fileName);
      } catch (err) {
        cb(new AppError("Failed to generate filename", 500), false);
      }
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 5, // Reduced from 1GB to 5MB for security
      fieldSize: 1024 * 1024 * 10, // Reduced from 1GB to 10MB
    },
    fileFilter: function (req, file, cb) {
      try {
        if (filter.CONTENT.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError(filter.MESSAGE, 400), false);
        }
      } catch (err) {
        cb(new AppError("File filter error", 500), false);
      }
    },
  });
};