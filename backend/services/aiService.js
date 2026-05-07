// backend/services/aiService.js
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Reduced for Groq free-tier safety
const MAX_TEXT_LENGTH = 1800;

// ─── SUMMARY ───────────────────────────────────────────────────
const generateSummary = async (text) => {
  const truncated = text.substring(0, MAX_TEXT_LENGTH);

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `Summarize these notes into concise bullet points highlighting only the most important ideas.

Notes:
${truncated}

Return bullet points only.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 700,
  });

  return response.choices[0].message.content;
};

// ─── DETAILED NOTES ────────────────────────────────────────────
const generateDetailedNotes = async (text) => {
  const truncated = text.substring(0, MAX_TEXT_LENGTH);

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `Convert this content into structured study notes with headings and explanations.

Content:
${truncated}

Return well-formatted study notes.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
};

// ─── FLASHCARDS ────────────────────────────────────────────────
const generateFlashcards = async (text) => {
  const truncated = text.substring(0, MAX_TEXT_LENGTH);

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `Generate exactly 6 flashcards from these notes.

Notes:
${truncated}

Return ONLY valid JSON array:
[
  { "front": "Question?", "back": "Answer" }
]`,
      },
    ],
    temperature: 0.6,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content;

  try {
    const match = content.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
};

// ─── QUIZ ──────────────────────────────────────────────────────
const generateQuiz = async (text) => {
  const truncated = text.substring(0, MAX_TEXT_LENGTH);

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `Generate exactly 5 MCQ questions from these notes.

Notes:
${truncated}

Return ONLY valid JSON array:
[
  {
    "question": "Question?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A) ..."
  }
]`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;

  try {
    const match = content.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
};

// ─── AI CHAT ───────────────────────────────────────────────────
const chatWithNote = async (noteText, chatHistory, userMessage) => {
  const truncatedNote = noteText.substring(0, 1500);

  const messages = [
    {
      role: 'system',
      content: `You are a study assistant. Answer only using the notes below.

Notes:
${truncatedNote}

If answer is not in notes, clearly say so.`,
    },
    ...chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    temperature: 0.5,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
};

module.exports = {
  generateSummary,
  generateDetailedNotes,
  generateFlashcards,
  generateQuiz,
  chatWithNote,
};