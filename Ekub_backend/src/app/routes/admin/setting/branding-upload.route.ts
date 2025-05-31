import express, { Request, Response } from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'public/uploads'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.post(
  '/light',
  upload.single('logoLight'),
  (req: Request, res: Response) => {
    // Guard against missing file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded for logoLight' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  }
);

router.post(
  '/dark',
  upload.single('logoDark'),
  (req: Request, res: Response) => {
    // Guard against missing file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded for logoDark' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
  }
);

export default router;
