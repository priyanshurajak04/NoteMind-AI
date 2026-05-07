// backend/routes/noteRoutes.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const {
  uploadNote,
  processNoteWithAI,
  chatNote,
  getNotes,
  getNoteById,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')),
});
const fileFilter = (req, file, cb) =>
  file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('Only PDFs allowed'), false);

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/upload',       protect, upload.single('pdf'), uploadNote);
router.post('/process/:id',  protect, processNoteWithAI);
router.post('/chat/:id',     protect, chatNote);
router.get('/',              protect, getNotes);
router.get('/:id',           protect, getNoteById);
router.delete('/:id',        protect, deleteNote);

module.exports = router;