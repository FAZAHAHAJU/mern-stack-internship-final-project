// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Mobile Menu Toggle State
  const [isOpen, setIsOpen] = useState(false);

  // Dark Mode State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme class to HTML element and persist preference
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Extract first letter of name for the circle profile icon placeholder
  const getInitials = () => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md dark:bg-slate-950 dark:border-b dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand Logo Link */}
        <Link to="/" className="text-xl font-bold tracking-wide text-indigo-400 hover:opacity-90 transition">
          TaskPetal
        </Link>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark Mode Toggle Switch */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'light' ? (
              /* Moon Icon */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              /* Sun Icon */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-300 text-sm font-medium transition">Dashboard</Link>
                <Link to="/tasks" className="hover:text-indigo-300 text-sm font-medium transition">Tasks</Link>
                <Link to="/profile" className="hover:text-indigo-300 text-sm font-medium transition flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-400">
                    {getInitials()}
                  </div>
                  <span className="text-slate-200 text-sm">{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-300 text-sm font-medium transition">Login</Link>
                <Link to="/register" className="hover:text-indigo-300 text-sm font-medium transition">Register</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Slide Down Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-700 dark:border-slate-800 flex flex-col gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="hover:text-indigo-300 text-sm font-medium transition py-1">Dashboard</Link>
              <Link to="/tasks" onClick={() => setIsOpen(false)} className="hover:text-indigo-300 text-sm font-medium transition py-1">Tasks</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="hover:text-indigo-300 text-sm font-medium transition flex items-center gap-2 py-1">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-400">
                  {getInitials()}
                </div>
                <span className="text-slate-200 text-sm">{user?.name}</span>
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="bg-red-650 hover:bg-red-750 py-2 rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer w-full text-center">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="hover:text-indigo-300 text-sm font-medium transition py-1">Login</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="hover:text-indigo-300 text-sm font-medium transition py-1">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}