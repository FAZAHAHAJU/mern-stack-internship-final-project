// src/pages/Tasks.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import PomodoroTimer from '../components/PomodoroTimer';
import { useTheme, themeColors } from '../context/ThemeContext';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Theme context
  const { themeName, setThemeName, activeColors } = useTheme();

  // Search, Filter, and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [sortOrder, setSortOrder] = useState('default');

  // Subtask Form States
  const [newSubtasks, setNewSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [editSubtaskInput, setEditSubtaskInput] = useState('');

  // New Task Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'General'
  });

  // Inline Editing Trackers
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'General'
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (currentSort = sortOrder) => {
    try {
      const response = await axiosInstance.get(`/tasks?sort=${currentSort}`);
      setTasks(response.data);
    } catch (err) {
      toast.error('Failed to fetch tasks from the database server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Subtasks drafting handlers
  const handleAddSubtaskDraft = () => {
    if (subtaskInput.trim()) {
      setNewSubtasks([...newSubtasks, { title: subtaskInput.trim(), completed: false }]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtaskDraft = (index) => {
    setNewSubtasks(newSubtasks.filter((_, idx) => idx !== index));
  };

  const handleAddEditSubtaskDraft = () => {
    if (editSubtaskInput.trim()) {
      setEditSubtasks([...editSubtasks, { title: editSubtaskInput.trim(), completed: false }]);
      setEditSubtaskInput('');
    }
  };

  const handleRemoveEditSubtaskDraft = (index) => {
    setEditSubtasks(editSubtasks.filter((_, idx) => idx !== index));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        subtasks: newSubtasks
      };
      const response = await axiosInstance.post('/tasks', payload);
      setTasks([response.data, ...tasks]);
      setFormData({ title: '', description: '', priority: 'medium', dueDate: '', category: 'General' });
      setNewSubtasks([]);
      toast.success('Task created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    const updatedStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await axiosInstance.put(`/tasks/${task._id}`, {
        status: updatedStatus
      });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
      toast.success(updatedStatus === 'completed' ? 'Task marked complete! 🎉' : 'Task marked pending');
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleTogglePin = async (task) => {
    const updatedPin = !task.isPinned;
    try {
      const response = await axiosInstance.put(`/tasks/${task._id}`, {
        isPinned: updatedPin
      });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
      toast.success(updatedPin ? 'Task pinned to top 📌' : 'Task unpinned');
    } catch (err) {
      toast.error('Failed to update task pinning');
    }
  };

  const handleToggleSubtask = async (task, subtaskIndex) => {
    try {
      const updatedSubtasks = task.subtasks.map((st, index) => 
        index === subtaskIndex ? { ...st, completed: !st.completed } : st
      );
      
      // If all subtasks are complete, check if user wants to mark parent complete too (or just keep it decoupled)
      const response = await axiosInstance.put(`/tasks/${task._id}`, {
        subtasks: updatedSubtasks
      });
      setTasks(tasks.map(t => t._id === task._id ? response.data : t));
    } catch (err) {
      toast.error('Failed to toggle checklist subtask');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to remove task resource');
      }
    }
  };

  const handleClearCompleted = async () => {
    if (window.confirm('Are you sure you want to permanently clear all completed tasks?')) {
      try {
        const response = await axiosInstance.delete('/tasks/clear-completed');
        toast.success(response.data.message || 'Completed tasks cleared successfully!');
        fetchTasks();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to clear completed tasks');
      }
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      category: task.category || 'General'
    });
    setEditSubtasks(task.subtasks || []);
    setEditSubtaskInput('');
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    setSubmitting(true);
    try {
      const response = await axiosInstance.put(`/tasks/${id}`, {
        ...editFormData,
        subtasks: editSubtasks
      });
      setTasks(tasks.map(t => t._id === id ? response.data : t));
      setEditingTaskId(null);
      toast.success('Task changes saved!');
    } catch (err) {
      toast.error('Failed to save task modifications');
    } finally {
      setSubmitting(false);
    }
  };

  // JSON Export Backups
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskpetal_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Tasks database backup exported as JSON!');
  };

  // CSV Sheet Export
  const handleExportCSV = () => {
    const headers = ['Title', 'Description', 'Category', 'Priority', 'Status', 'DueDate', 'Pinned', 'SubtasksCount', 'CreatedAt'];
    const rows = tasks.map(t => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.category || 'General').replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      t.isPinned ? 'Yes' : 'No',
      t.subtasks ? t.subtasks.length : 0,
      new Date(t.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskpetal_sheet_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Task list exported as CSV spreadsheet!');
  };

  // JSON File Importer
  const handleImportJSON = (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    const reader = new FileReader();
    reader.readAsText(files[0], "UTF-8");
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) {
          toast.error("File is not a valid backup task array.");
          return;
        }

        let successCount = 0;
        setLoading(true);
        for (const item of importedData) {
          const cleanItem = {
            title: item.title,
            description: item.description,
            priority: item.priority || 'medium',
            category: item.category || 'General',
            dueDate: item.dueDate || '',
            status: item.status || 'pending',
            subtasks: item.subtasks || []
          };
          if (cleanItem.title && cleanItem.description) {
            await axiosInstance.post('/tasks', cleanItem);
            successCount++;
          }
        }
        toast.success(`Import succeeded! Imported ${successCount} tasks.`);
        fetchTasks();
      } catch (err) {
        toast.error("Error parsing JSON file. Check format.");
        setLoading(false);
      }
    };
  };

  // Calculate dynamic countdown badges
  const getCountdownBadge = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900 animate-pulse">
          Overdue by {absDays} {absDays === 1 ? 'day' : 'days'}
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-bounce dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-900">
          Due Today ⏰
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          {diffDays} {diffDays === 1 ? 'day left' : 'days left'}
        </span>
      );
    }
  };

  // Get style capsule class for categories
  const getCategoryStyle = (cat) => {
    const category = cat || 'General';
    switch (category.toLowerCase()) {
      case 'work':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
      case 'college':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
      case 'personal':
        return 'bg-pink-50 text-pink-705 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
  };

  // Render Subtasks Progress Bar Helper
  const renderSubtasksProgress = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter(s => s.completed).length;
    const total = task.subtasks.length;
    const percentage = Math.round((completed / total) * 100);
    return (
      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Subtasks Progress</span>
          <span>{completed}/{total} ({percentage}%)</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
          <div 
            style={{ width: `${percentage}%` }}
            className={`${activeColors.primaryBg} h-full rounded-full transition-all duration-300`}
          ></div>
        </div>
      </div>
    );
  };

  // --- COMPUTE LIVE AGGREGATE TASK COUNTS FOR THE TABS ---
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
  };

  // --- COMBINED SEARCH + FILTER SELECTION FILTERING ENGINE ---
  const filteredTasks = tasks.filter(task => {
    let matchesFilter = true;
    if (activeFilter === 'pending') matchesFilter = task.status === 'pending';
    else if (activeFilter === 'completed') matchesFilter = task.status === 'completed';
    else if (activeFilter === 'high') matchesFilter = task.priority === 'high';

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.category && task.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // --- TASK PINNING SORT BUBBLE UP LOGIC ---
  const processedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return 0; 
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-6 text-left">
      
      {/* COLUMN 1: CONTROL PANEL & ACCENT THEME & DATA BACKUP */}
      <div className="space-y-6">
        
        {/* ADD TASK CARD */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Add New Task</h2>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Task Title
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  disabled={submitting}
                  className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 ${activeColors.primaryRing} outline-none disabled:opacity-50 transition`} 
                  placeholder="e.g., Fix styling patches" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  disabled={submitting}
                  className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 ${activeColors.primaryRing} outline-none h-24 disabled:opacity-50 transition`} 
                  placeholder="Core specs..." 
                  required 
                />
              </div>

              {/* Dynamic Subtask Checklist Form Entry */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Checklist Items (Subtasks)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    placeholder="Subtask name..."
                    className="flex-1 p-2 border border-slate-200 dark:border-slate-800 text-xs rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtaskDraft(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtaskDraft}
                    className={`px-3 rounded text-xs font-bold text-white cursor-pointer ${activeColors.primaryBg} ${activeColors.primaryBgHover}`}
                  >
                    +
                  </button>
                </div>
                
                {newSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 border border-slate-150 dark:border-slate-850 rounded bg-slate-50 dark:bg-slate-900/60">
                    {newSubtasks.map((st, index) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-white dark:bg-slate-850 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-700 dark:text-slate-350 truncate pr-2">{st.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtaskDraft(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold transition px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Category Tag
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  disabled={submitting}
                  className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 ${activeColors.primaryRing} outline-none disabled:opacity-50 transition`}
                >
                  <option value="General">General</option>
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="College">College</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    Priority
                  </label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange} 
                    disabled={submitting}
                    className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 ${activeColors.primaryRing} outline-none disabled:opacity-50 transition`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={formData.dueDate} 
                    onChange={handleInputChange} 
                    disabled={submitting}
                    className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 ${activeColors.primaryRing} outline-none disabled:opacity-50 transition`} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className={`w-full text-white p-2.5 rounded-lg font-semibold transition duration-200 shadow-sm mt-2 flex justify-center items-center cursor-pointer disabled:opacity-55 ${activeColors.primaryBg} ${activeColors.primaryBgHover} ${activeColors.primaryBgActive}`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Create Task'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ACCENT THEME CUSTOMIZER CARD */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Accent Theme Preset
          </h3>
          <div className="flex items-center gap-3">
            {Object.keys(themeColors).map((name) => {
              const colors = themeColors[name];
              let circleColor = 'bg-indigo-650';
              if (name === 'emerald') circleColor = 'bg-emerald-600';
              if (name === 'rose') circleColor = 'bg-rose-600';
              if (name === 'amber') circleColor = 'bg-amber-500';
              
              return (
                <button
                  key={name}
                  onClick={() => setThemeName(name)}
                  className={`w-7 h-7 rounded-full transition transform hover:scale-110 active:scale-95 cursor-pointer relative flex items-center justify-center ${circleColor} ${
                    themeName === name ? 'ring-4 ring-indigo-200 dark:ring-slate-700 shadow-md scale-105' : 'opacity-80'
                  }`}
                  title={colors.name}
                >
                  {themeName === name && (
                    <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Personalizes the buttons, highlights, progress indicators, and dials across the workspace.
          </p>
        </div>

        {/* DATA BACKUP & INTEGRITY CARD */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Backup & Portability
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="flex-1 py-1.5 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-800 text-slate-650 dark:text-slate-350"
            >
              📥 Backup JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 py-1.5 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1 border border-slate-200/50 dark:border-slate-800 text-slate-650 dark:text-slate-350"
            >
              📊 Export CSV
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
            <label className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase mb-1 tracking-wider">
              Import JSON Backup
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 dark:file:bg-slate-900 file:text-slate-650 dark:file:text-slate-300 hover:file:bg-slate-205 dark:hover:file:bg-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* POMODORO TIMER MODULE */}
        <PomodoroTimer />
      </div>

      {/* COLUMN 2 & 3: MAIN VIEW BOARD LAYOUT */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* LIVE SEARCH, SORT & FILTER ACTION PANEL */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className={`w-full p-2.5 pl-4 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 ${activeColors.primaryRing} text-sm bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100`} 
                placeholder="🔍 Search tasks by title, details, or category..." 
              />
            </div>
            
            {/* SORTING DROPDOWN CONTAINER */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <label className="text-[11px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">
                Sort:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  fetchTasks(e.target.value);
                }}
                className={`p-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-2 ${activeColors.primaryRing} outline-none cursor-pointer`}
              >
                <option value="default">Default (Newest)</option>
                <option value="dueDateAsc">Soonest Due 📅</option>
                <option value="dueDateDesc">Latest Due 📅</option>
              </select>
            </div>
          </div>

          {/* FILTER TAB CLUSTERS MAP & BULK CLEAR BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-150 dark:border-slate-850">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {[
                { id: 'all', label: 'All Tasks' },
                { id: 'pending', label: '⏳ Pending' },
                { id: 'completed', label: '✅ Completed' },
                { id: 'high', label: '🔥 High Priority' }
              ].map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveFilter(tab.id)} 
                  className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 border cursor-pointer ${
                    activeFilter === tab.id 
                      ? `${activeColors.tabActive}` 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeFilter === tab.id ? `${activeColors.countBadge}` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {counts[tab.id]}
                  </span>
                </button>
              ))}
            </div>

            {/* SLEEK CLEAR COMPLETED BUTTON */}
            {counts.completed > 0 && (
              <button 
                onClick={handleClearCompleted}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-455 flex items-center gap-1.5 transition cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Completed ({counts.completed})
              </button>
            )}
          </div>
        </div>

        {/* TASK STREAM OUTPUT CONTAINER */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Loading your synchronized data board...
            </div>
          ) : processedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              No matching tasks found for your current search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {processedTasks.map((task) => (
                <div 
                  key={task._id} 
                  className={`bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-5 rounded-xl shadow-sm border transition ${
                    task.isPinned
                      ? `border-${activeColors.primary.split('-')[0]}-400 dark:border-${activeColors.primary.split('-')[0]}-700 bg-${activeColors.primary.split('-')[0]}-50/10 dark:bg-${activeColors.primary.split('-')[0]}-950/10`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  
                  {editingTaskId === task._id ? (
                    /* === CARD EDIT MODE LAYOUT === */
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        name="title" 
                        value={editFormData.title} 
                        onChange={handleEditInputChange} 
                        disabled={submitting}
                        className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 ${activeColors.primaryRing} disabled:opacity-50`} 
                      />
                      <textarea 
                        name="description" 
                        value={editFormData.description} 
                        onChange={handleEditInputChange} 
                        disabled={submitting}
                        className={`w-full p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm outline-none focus:ring-2 ${activeColors.primaryRing} h-20 disabled:opacity-50`} 
                      />
                      
                      {/* Dynamic Subtask Checklist Form Entry in EDIT Mode */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                          Edit Checklist Subtasks
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editSubtaskInput}
                            onChange={(e) => setEditSubtaskInput(e.target.value)}
                            placeholder="Add subtask..."
                            className="flex-1 p-2 border border-slate-200 dark:border-slate-800 text-xs rounded bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 outline-none"
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditSubtaskDraft(); } }}
                          />
                          <button
                            type="button"
                            onClick={handleAddEditSubtaskDraft}
                            className={`px-3 rounded text-xs font-bold text-white cursor-pointer ${activeColors.primaryBg} ${activeColors.primaryBgHover}`}
                          >
                            +
                          </button>
                        </div>
                        
                        {editSubtasks.length > 0 && (
                          <div className="space-y-1.5 max-h-24 overflow-y-auto p-1.5 border border-slate-150 dark:border-slate-855 rounded bg-slate-50 dark:bg-slate-900/40">
                            {editSubtasks.map((st, index) => (
                              <div key={index} className="flex justify-between items-center text-xs bg-white dark:bg-slate-850 p-1 rounded border border-slate-100 dark:border-slate-800">
                                <span className="text-slate-700 dark:text-slate-350 truncate pr-2">{st.title}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditSubtaskDraft(index)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold transition px-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <select 
                          name="priority" 
                          value={editFormData.priority} 
                          onChange={handleEditInputChange} 
                          disabled={submitting}
                          className={`p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none disabled:opacity-50`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        
                        <select 
                          name="category" 
                          value={editFormData.category} 
                          onChange={handleEditInputChange} 
                          disabled={submitting}
                          className={`p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none disabled:opacity-50`}
                        >
                          <option value="General">General</option>
                          <option value="Personal">Personal</option>
                          <option value="Work">Work</option>
                          <option value="College">College</option>
                        </select>

                        <input 
                          type="date" 
                          name="dueDate" 
                          value={editFormData.dueDate} 
                          onChange={handleEditInputChange} 
                          disabled={submitting}
                          className={`p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm outline-none disabled:opacity-50`} 
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button 
                          onClick={() => setEditingTaskId(null)} 
                          disabled={submitting}
                          className="px-3 py-1.5 rounded text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-slate-650 dark:text-slate-350 transition cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSaveEdit(task._id)} 
                          disabled={submitting}
                          className="px-3 py-1.5 rounded text-sm bg-green-600 hover:bg-green-700 active:bg-green-800 font-semibold text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* === CARD STANDARD DISPLAY VIEW === */
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {/* Pin / Star Toggle Icon */}
                            <button
                              onClick={() => handleTogglePin(task)}
                              className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition transform active:scale-90 cursor-pointer ${
                                task.isPinned 
                                  ? 'text-amber-500 animate-pulse' 
                                  : 'text-slate-300 dark:text-slate-650 hover:text-slate-400 dark:hover:text-slate-500'
                              }`}
                              title={task.isPinned ? "Unpin task" : "Pin task to top"}
                            >
                              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                {task.isPinned ? (
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                ) : (
                                  <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03z" />
                                )}
                              </svg>
                            </button>

                            <h3 className={`text-lg font-bold text-slate-850 dark:text-slate-200 ${
                              task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
                            }`}>
                              {task.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* Stylish Category Pill Badge */}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getCategoryStyle(task.category)}`}>
                              {task.category || 'General'}
                            </span>

                            {/* Priority Badge Mapping with Premium Styling */}
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                              task.priority === 'high' 
                                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900' 
                                : task.priority === 'medium' 
                                ? 'bg-amber-105 text-amber-800 border-amber-200 dark:bg-amber-955/60 dark:text-amber-300 dark:border-amber-900' 
                                : 'bg-emerald-100 text-emerald-805 border-emerald-205 dark:bg-emerald-950/60 dark:text-emerald-305 dark:border-emerald-900'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <p className={`text-slate-650 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed ${
                          task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}>
                          {task.description}
                        </p>
                      </div>

                      {/* Render checklist subtasks inside standard card view */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                          {task.subtasks.map((st, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => handleToggleSubtask(task, idx)}
                                className={`w-3.5 h-3.5 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 rounded cursor-pointer`}
                              />
                              <span className={st.completed ? 'line-through text-slate-400 dark:text-slate-550 font-normal' : ''}>
                                {st.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Render Subtask Checklist progress bar details */}
                      {renderSubtasksProgress(task)}
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        {/* Due Date & Real-time Countdown badge */}
                        <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-450">
                          <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
                          {getCountdownBadge(task.dueDate)}
                        </div>
                        
                        <div className="flex gap-3 items-center self-end sm:self-auto">
                          <button 
                            onClick={() => handleToggleComplete(task)} 
                            className={`font-semibold px-2.5 py-1 rounded border transition cursor-pointer text-xs ${
                              task.status === 'completed' 
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-450 dark:border-green-900' 
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-955/40 dark:text-amber-450 dark:border-amber-900'
                            }`}
                          >
                            ✓ {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                          </button>
                          <button 
                            onClick={() => startEditing(task)} 
                            className={`${activeColors.accentText} ${activeColors.accentHoverText} font-semibold transition cursor-pointer`}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task._id)} 
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}