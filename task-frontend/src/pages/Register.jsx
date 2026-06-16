// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axiosInstance.post('/auth/register', formData);
      toast.success(response.data.message || 'Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong during registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-4 sm:p-6 bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 text-left">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-100">Create your Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1">
            Full Name
          </label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            disabled={submitting}
            className="w-full p-2.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition" 
            placeholder="John Doe" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1">
            Email Address
          </label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            disabled={submitting}
            className="w-full p-2.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition" 
            placeholder="your@email.com" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1">
            Password
          </label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            disabled={submitting}
            className="w-full p-2.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition" 
            placeholder="••••••••" 
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-indigo-600 text-white p-2.5 rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition duration-200 flex justify-center items-center cursor-pointer disabled:opacity-55"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-650 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}