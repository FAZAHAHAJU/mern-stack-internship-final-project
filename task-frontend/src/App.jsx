// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast'; // Import toaster engine
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function AuthRedirectRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  // If user is already authenticated, redirect them away from login/register directly onto dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Toast Notification Mount Target Container */}
            <Toaster 
              position="top-right" 
              reverseOrder={false}
              toastOptions={{
                // Add subtle dark mode style for toast alerts as well
                className: 'dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700',
              }}
            />
            
            <Navbar />
            <main className="container mx-auto mt-6 px-4 pb-12">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                {/* PROTECTED ROUTES */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* PUBLIC AUTHENTICATION HANDLERS WITH REDIRECT GUARDS */}
                <Route path="/login" element={<AuthRedirectRoute><Login /></AuthRedirectRoute>} />
                <Route path="/register" element={<AuthRedirectRoute><Register /></AuthRedirectRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}