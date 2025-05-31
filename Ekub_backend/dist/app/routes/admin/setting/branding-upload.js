"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'public/uploads'),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = (0, multer_1.default)({ storage });
router.post('/light', upload.single('logoLight'), (req, res) => {
    // Guard against missing file
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded for logoLight' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
});
router.post('/dark', upload.single('logoDark'), (req, res) => {
    // Guard against missing file
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded for logoDark' });
    }
    return res.json({ url: `/uploads/${req.file.filename}` });
});
exports.default = router;
