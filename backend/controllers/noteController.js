// backend/controllers/noteController.js
const Note = require('../models/Note');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const {
  generateSummary,
  generateDetailedNotes,
  generateFlashcards,
  generateQuiz,
  chatWithNote,
} = require('../services/aiService');

// ─── UPLOAD PDF ────────────────────────────────────────────────
const uploadNote = async (req, res) => {
  try {
    console.log('📥 Upload request received');

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        message: 'Could not extract text. PDF may be image-based.',
      });
    }

    const note = await Note.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      extractedText,
    });

    console.log('✅ Note saved:', note._id);

    res.status(201).json({
      message: 'PDF uploaded successfully! Click Generate to create AI study materials.',
      note: {
        id: note._id,
        fileName: note.fileName,
        createdAt: note.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Server error during upload.' });
  }
};

// ─── PROCESS WITH AI ───────────────────────────────────────────
const processNoteWithAI = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    console.log(`🤖 Processing: ${note.fileName}`);

    // Sequential processing to avoid Groq rate limit
    const summary = await generateSummary(note.extractedText);

    const detailedNotes = await generateDetailedNotes(note.extractedText);

    const flashcards = await generateFlashcards(note.extractedText);

    const quiz = await generateQuiz(note.extractedText);

    note.summary = summary;
    note.detailedNotes = detailedNotes;
    note.flashcards = flashcards;
    note.quiz = quiz;

    await note.save();

    console.log(`✅ AI done: ${note.fileName}`);

    res.status(200).json({
      message: 'AI processing complete!',
      note: {
        id: note._id,
        fileName: note.fileName,
        summary: note.summary,
        detailedNotes: note.detailedNotes,
        flashcards: note.flashcards,
        quiz: note.quiz,
      },
    });
  } catch (error) {
    console.error('AI error:', error.message);

    if (
      error.message?.includes('rate_limit') ||
      error.status === 429
    ) {
      return res.status(429).json({
        message:
          'Groq rate limit reached. Please wait a few seconds and try again.',
      });
    }

    res.status(500).json({ message: 'AI processing failed.' });
  }
};

// ─── CHAT WITH NOTE ────────────────────────────────────────────
const chatNote = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const aiReply = await chatWithNote(
      note.extractedText,
      note.chatHistory,
      message
    );

    note.chatHistory.push({ role: 'user', content: message });
    note.chatHistory.push({ role: 'assistant', content: aiReply });

    if (note.chatHistory.length > 20) {
      note.chatHistory = note.chatHistory.slice(-20);
    }

    await note.save();

    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ message: 'Chat failed. Please try again.' });
  }
};

// ─── GET ALL NOTES ─────────────────────────────────────────────
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText -chatHistory');

    res.status(200).json({
      message: 'Notes fetched!',
      count: notes.length,
      notes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── GET SINGLE NOTE ───────────────────────────────────────────
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    res.status(200).json({
      message: 'Note fetched!',
      note,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── DELETE NOTE ───────────────────────────────────────────────
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Note deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  uploadNote,
  processNoteWithAI,
  chatNote,
  getNotes,
  getNoteById,
  deleteNote,
};