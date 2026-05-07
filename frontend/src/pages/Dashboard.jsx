// frontend/src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { uploadNote, processNote, getNotes, getNoteById, deleteNote, chatWithNote } from '../services/api';

const MAX_FILE_MB = 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// ══════════════════════════════════════════════════════════════
// QUIZ COMPONENT
// ══════════════════════════════════════════════════════════════
function QuizTab({ quiz }) {
  const [selected, setSelected]     = useState({});
  const [checked, setChecked]       = useState({});
  const [correct, setCorrect]       = useState(new Set());

  useEffect(() => { setSelected({}); setChecked({}); setCorrect(new Set()); }, [quiz]);

  const handleSelect = (qi, opt) => { if (!checked[qi]) setSelected(p => ({ ...p, [qi]: opt })); };
  const handleCheck  = (qi) => {
    if (!selected[qi] || checked[qi]) return;
    setChecked(p => ({ ...p, [qi]: true }));
    const q = quiz[qi];
    const ok = selected[qi] === q.answer || q.answer?.includes(selected[qi]?.charAt(0));
    if (ok) setCorrect(p => new Set([...p, qi]));
  };

  if (!quiz || quiz.length === 0)
    return <p className="text-gray-500 text-center py-10">No quiz generated yet.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Quiz Questions</h3>
        <span className="bg-blue-600/20 text-blue-400 text-sm px-3 py-1 rounded-full border border-blue-500/30">
          Score: {correct.size} / {quiz.length}
        </span>
      </div>
      <div className="space-y-5">
        {quiz.map((q, qi) => {
          const isChecked = checked[qi];
          const selOpt    = selected[qi];
          const isCorrect = selOpt === q.answer || q.answer?.includes(selOpt?.charAt(0));
          return (
            <div key={qi} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
              <p className="text-white font-medium mb-4">Q{qi + 1}. {q.question}</p>
              <div className="space-y-2 mb-4">
                {q.options.map((opt, oi) => {
                  const isSel  = selOpt === opt;
                  const isCorr = opt === q.answer || q.answer?.includes(opt?.charAt(0));
                  let cls = 'bg-gray-800 text-gray-300 border-gray-700';
                  if (isChecked) {
                    if (isCorr)      cls = 'bg-green-500/15 text-green-300 border-green-500/40';
                    else if (isSel)  cls = 'bg-red-500/15 text-red-300 border-red-500/40';
                    else             cls = 'bg-gray-800 text-gray-500 border-gray-700';
                  } else if (isSel)  cls = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
                  return (
                    <div key={oi} onClick={() => handleSelect(qi, opt)}
                      className={`px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition ${cls} ${!isChecked ? 'hover:border-gray-500' : ''}`}>
                      {opt}
                    </div>
                  );
                })}
              </div>
              {!isChecked ? (
                <button onClick={() => handleCheck(qi)} disabled={!selOpt}
                  className="text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition">
                  Check Answer
                </button>
              ) : (
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✅ Correct!' : `❌ Wrong — ${q.answer}`}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {Object.keys(checked).length === quiz.length && (
        <div className="mt-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-5 text-center">
          <p className="text-white font-bold text-lg">🎉 {correct.size}/{quiz.length} correct!</p>
          <p className="text-gray-400 text-sm mt-1">
            {correct.size === quiz.length ? 'Perfect! 🌟' : correct.size >= quiz.length / 2 ? 'Good work! 💪' : 'Keep studying! 📚'}
          </p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FLASHCARD COMPONENT
// ══════════════════════════════════════════════════════════════
function FlashcardsTab({ flashcards }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setCurrent(0); setFlipped(false); }, [flashcards]);

  if (!flashcards || flashcards.length === 0)
    return <p className="text-gray-500 text-center py-10">No flashcards generated yet.</p>;

  const card = flashcards[current];
  return (
    <div className="flex flex-col items-center">
      <p className="text-gray-400 text-sm mb-4">{current + 1} of {flashcards.length}</p>

      {/* Card */}
      <div onClick={() => setFlipped(p => !p)}
        className="w-full max-w-lg h-52 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center p-8 cursor-pointer select-none transition hover:border-blue-500/50 shadow-xl">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            {flipped ? 'Answer' : 'Question'}
          </p>
          <p className="text-white text-lg font-medium leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
        </div>
      </div>
      <p className="text-gray-600 text-xs mt-3">Click card to flip</p>

      {/* Nav */}
      <div className="flex items-center gap-4 mt-6">
        <button onClick={() => { setCurrent(p => Math.max(0, p - 1)); setFlipped(false); }}
          disabled={current === 0}
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm rounded-xl transition">
          ← Prev
        </button>
        <div className="flex gap-1.5">
          {flashcards.map((_, i) => (
            <div key={i} onClick={() => { setCurrent(i); setFlipped(false); }}
              className={`w-2 h-2 rounded-full cursor-pointer transition ${i === current ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`} />
          ))}
        </div>
        <button onClick={() => { setCurrent(p => Math.min(flashcards.length - 1, p + 1)); setFlipped(false); }}
          disabled={current === flashcards.length - 1}
          className="px-5 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white text-sm rounded-xl transition">
          Next →
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CHAT COMPONENT
// ══════════════════════════════════════════════════════════════
function ChatTab({ noteId, initialHistory }) {
  const [messages, setMessages] = useState(initialHistory || []);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    setMessages(initialHistory || []);
  }, [noteId, initialHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await chatWithNote(noteId, { message: userMsg });
      setMessages(p => [...p, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Sorry, I could not answer that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400 font-medium">Ask anything about your notes</p>
            <p className="text-gray-600 text-sm mt-1">The AI will answer based on your PDF content</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-md'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask a question about your notes..."
          className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm placeholder-gray-600 transition"
        />
        <button onClick={handleSend} disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-3 rounded-xl transition font-medium text-sm shrink-0">
          Send
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ══════════════════════════════════════════════════════════════
function Sidebar({ history, activeId, onSelect, onDelete, isOpen, onToggle, onNewUpload }) {
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className={`relative flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out shrink-0 ${isOpen ? 'w-64' : 'w-14'} min-h-screen`}>

      {/* Header */}
      <div className={`flex items-center border-b border-gray-800 px-3 py-4 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && <span className="text-white font-semibold text-sm">📂 Notes</span>}
        <button onClick={onToggle}
          className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* New Upload */}
      <div className={`px-2 py-2 border-b border-gray-800 ${isOpen ? '' : 'flex justify-center'}`}>
        <button onClick={onNewUpload} title="New Upload"
          className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition ${isOpen ? 'w-full px-3 py-2.5 justify-start' : 'w-9 h-9 justify-center'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {isOpen && <span>New Upload</span>}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isOpen && history.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-8 px-2">Upload a PDF to get started</p>
        )}
        {history.map((note) => (
          <div key={note._id} onClick={() => onSelect(note._id)} title={!isOpen ? note.fileName : ''}
            className={`group relative flex items-center gap-2.5 rounded-xl cursor-pointer transition border ${isOpen ? 'p-3' : 'p-2.5 justify-center'} ${
              activeId === note._id ? 'bg-blue-600/10 border-blue-500/30' : 'border-transparent hover:bg-gray-800'}`}>
            <span className="text-base shrink-0">📄</span>
            {isOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${activeId === note._id ? 'text-blue-400' : 'text-gray-300'}`}>
                    {note.fileName}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{fmt(note.createdAt)}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); onDelete(note._id, note.fileName); }}
                  className="shrink-0 text-gray-700 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
const TABS = ['Summary', 'Detailed Notes', 'Flashcards', 'Quiz', 'Chat'];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [file, setFile]               = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [processing, setProcessing]   = useState(false);
  const [step, setStep]               = useState('upload'); // upload | process | results
  const [activeTab, setActiveTab]     = useState('Summary');
  const [noteId, setNoteId]           = useState(null);
  const [fileName, setFileName]       = useState('');
  const [summary, setSummary]         = useState('');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [flashcards, setFlashcards]   = useState([]);
  const [quiz, setQuiz]               = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [history, setHistory]         = useState([]);
  const [activeId, setActiveId]       = useState(null);
  const [error, setError]             = useState('');
  const [processStep, setProcessStep] = useState(0);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await getNotes();
      setHistory(res.data.notes);
    } catch (e) {
      console.error('History fetch failed:', e.message);
    }
  };

  const resetState = () => {
    setFile(null); setNoteId(null); setFileName('');
    setSummary(''); setDetailedNotes(''); setFlashcards([]);
    setQuiz([]); setChatHistory([]); setError('');
    setActiveId(null); setStep('upload'); setActiveTab('Summary');
    setProcessStep(0);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files are allowed.'); setFile(null); return; }
    if (f.size > MAX_FILE_BYTES) { setError(`File too large. Max ${MAX_FILE_MB}MB allowed.`); setFile(null); return; }
    setFile(f); setError('');
  };

  const handleUpload = async () => {
    if (!file) return setError('Select a PDF first.');
    setError(''); setUploading(true);
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res = await uploadNote(fd);
      const n = res.data.note;
      setNoteId(n.id); setFileName(n.fileName); setActiveId(n.id);
      setHistory(p => [{ _id: n.id, fileName: n.fileName, createdAt: n.createdAt }, ...p]);
      setStep('process');
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!noteId) return;
    setError(''); setProcessing(true); setProcessStep(1);
    const steps = [
      setTimeout(() => setProcessStep(2), 3000),
      setTimeout(() => setProcessStep(3), 6000),
      setTimeout(() => setProcessStep(4), 9000),
    ];
    try {
      const res = await processNote(noteId);
      steps.forEach(clearTimeout);
      const n = res.data.note;
      setSummary(n.summary || '');
      setDetailedNotes(n.detailedNotes || '');
      setFlashcards(n.flashcards || []);
      setQuiz(n.quiz || []);
      setStep('results'); setActiveTab('Summary');
    } catch (e) {
      steps.forEach(clearTimeout);
      setError(e.response?.data?.message || 'AI processing failed.');
    } finally {
      setProcessing(false); setProcessStep(0);
    }
  };

  const handleSelectNote = async (id) => {
    try {
      setError(''); setActiveId(id);
      const res = await getNoteById(id);
      const n = res.data.note;
      setNoteId(n._id); setFileName(n.fileName);
      setSummary(n.summary || '');
      setDetailedNotes(n.detailedNotes || '');
      setFlashcards(n.flashcards || []);
      setQuiz(n.quiz || []);
      setChatHistory(n.chatHistory || []);
      setStep(n.summary ? 'results' : 'process');
      setActiveTab('Summary');
    } catch {
      setError('Failed to load note.');
    }
  };

  const handleDeleteNote = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteNote(id);
      setHistory(p => p.filter(n => n._id !== id));
      if (activeId === id) resetState();
    } catch {
      setError('Delete failed.');
    }
  };

  const processSteps = ['Extracting content', 'Generating summary', 'Creating flashcards', 'Building quiz'];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <Sidebar
          history={history} activeId={activeId}
          onSelect={handleSelectNote} onDelete={handleDeleteNote}
          isOpen={sidebarOpen} onToggle={() => setSidebarOpen(p => !p)}
          onNewUpload={resetState}
        />

        {/* MAIN */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">

            {/* Page header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Study Dashboard</h2>
              <p className="text-gray-500 text-sm mt-1">Upload PDF notes → AI generates your study materials</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            {/* ── STEP: UPLOAD ── */}
            {step === 'upload' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-2">📄 Upload PDF Notes</h3>
                <p className="text-gray-500 text-sm mb-6">Upload any lecture notes, textbook chapter, or study material</p>

                <label className="block border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-2xl p-12 text-center cursor-pointer transition-all group">
                  <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</div>
                  {file ? (
                    <div>
                      <p className="text-green-400 font-semibold text-lg">{file.name}</p>
                      <p className="text-gray-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 font-semibold text-lg">Click to select a PDF</p>
                      <p className="text-gray-600 text-sm mt-2">PDF files only • Max {MAX_FILE_MB}MB</p>
                    </>
                  )}
                </label>

                <button onClick={handleUpload} disabled={!file || uploading}
                  className="mt-6 w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5">
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Uploading...
                    </span>
                  ) : '⬆️  Upload PDF'}
                </button>
              </div>
            )}

            {/* ── STEP: PROCESS ── */}
            {step === 'process' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                {!processing ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">PDF Uploaded!</h3>
                    <p className="text-gray-400 mb-1">
                      <span className="text-blue-400 font-medium">{fileName}</span>
                    </p>
                    <p className="text-gray-500 text-sm mb-8">Generate AI-powered summary, detailed notes, flashcards, and quiz</p>

                    <button onClick={handleProcess}
                      className="px-10 py-3.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg hover:-translate-y-0.5">
                      🤖 Generate Study Materials
                    </button>
                    <button onClick={resetState} className="block mx-auto mt-4 text-gray-600 hover:text-gray-400 text-sm transition">
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="animate-spin w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-6">AI is processing your notes...</h3>
                    <div className="max-w-xs mx-auto space-y-3">
                      {processSteps.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            processStep > i ? 'bg-green-500' : processStep === i + 1 ? 'bg-blue-500 animate-pulse' : 'bg-gray-800 border border-gray-700'
                          }`}>
                            {processStep > i && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={processStep >= i + 1 ? 'text-white' : 'text-gray-600'}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP: RESULTS ── */}
            {step === 'results' && (
              <div>
                {/* File badge */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-900 border border-gray-800 rounded-xl">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{fileName}</p>
                    <p className="text-gray-500 text-xs">AI study materials ready</p>
                  </div>
                  <button onClick={resetState}
                    className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition">
                    New Upload
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-900/50 border border-gray-800 p-1 rounded-xl mb-6 overflow-x-auto">
                  {TABS.map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        activeTab === t ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}>
                      {t === 'Summary' && '📝 '}
                      {t === 'Detailed Notes' && '📖 '}
                      {t === 'Flashcards' && '🃏 '}
                      {t === 'Quiz' && '🧠 '}
                      {t === 'Chat' && '💬 '}
                      {t}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

                  {activeTab === 'Summary' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">📝 AI Summary</h3>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {summary || 'No summary available.'}
                      </div>
                    </div>
                  )}

                  {activeTab === 'Detailed Notes' && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">📖 Detailed Notes</h3>
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {detailedNotes || 'No detailed notes available.'}
                      </div>
                    </div>
                  )}

                  {activeTab === 'Flashcards' && <FlashcardsTab flashcards={flashcards} />}
                  {activeTab === 'Quiz'       && <QuizTab quiz={quiz} />}
                  {activeTab === 'Chat'       && <ChatTab noteId={noteId} initialHistory={chatHistory} />}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}