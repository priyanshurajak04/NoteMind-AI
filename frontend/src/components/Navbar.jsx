// frontend/src/components/Navbar.jsx
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    // Clear everything from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // replace: true prevents going back to dashboard after logout
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">🧠 NoteMind AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hi, {user.name} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}