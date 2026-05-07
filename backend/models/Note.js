// backend/models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    detailedNotes: {
      type: String,
      default: '',
    },
    flashcards: {
      type: Array,
      default: [],
    },
    quiz: {
      type: Array,
      default: [],
    },
    chatHistory: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;