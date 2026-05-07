// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* ── Decorative blobs ── */}
      <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-purple-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-80 h-80 bg-blue-600 opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-500 opacity-5 rounded-full blur-2xl pointer-events-none" />

      {/* ── Auth Card ── */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn">

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl px-8 py-10 shadow-2xl">

          {/* Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">NoteMind AI</h1>
            <p className="text-gray-400 text-sm mt-1">Study smarter with AI</p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Free forever • No credit card needed</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-gray-800/60 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition placeholder-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-800/60 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition placeholder-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                className="w-full bg-gray-800/60 text-white px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition placeholder-gray-600 text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60
                bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500
                shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          {/* Features list */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {['📄 PDF Upload', '🤖 AI Summary', '🧠 Auto Quiz'].map((f) => (
              <div key={f} className="bg-gray-800/50 rounded-xl px-2 py-2">
                <p className="text-gray-400 text-xs">{f}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
              Sign in →
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-5">
          Secure • Private • Free to use
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}