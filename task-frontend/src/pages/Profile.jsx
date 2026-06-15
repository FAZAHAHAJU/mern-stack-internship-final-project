// src/pages/Profile.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-left">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-indigo-600 text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto border-4 border-indigo-100 dark:border-indigo-950 shadow-sm mb-3">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Active Profile Account Workspace</p>
      </div>

      <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Registered Name
          </label>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-medium">
            {user?.name}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 text-sm font-medium">
            {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
}