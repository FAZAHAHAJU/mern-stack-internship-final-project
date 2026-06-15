// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authMiddleware to all routes in this file to protect them
router.use(authMiddleware);

// POST /api/tasks — Create a task linked to the logged-in user
router.post('/', async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate, category, subtasks } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTask = new Task({
      title,
      description,
      priority,
      status,
      dueDate,
      category: category || "General",
      subtasks: subtasks || [],
      createdBy: req.user 
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks — Return only the logged-in user's tasks with sorting
router.get('/', async (req, res, next) => {
  try {
    const { sort } = req.query;
    let query = Task.find({ createdBy: req.user });

    if (sort === 'dueDateAsc') {
      query = query.sort({ dueDate: 1 });
    } else if (sort === 'dueDateDesc') {
      query = query.sort({ dueDate: -1 });
    } else {
      // Default: sort by creation date (newest first)
      query = query.sort({ createdAt: -1 });
    }

    const userTasks = await query;
    res.json(userTasks);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/clear-completed — Remove all completed tasks for logged-in user
// Note: This must be placed BEFORE router.delete('/:id') so Express doesn't match 'clear-completed' as ':id'
router.delete('/clear-completed', async (req, res, next) => {
  try {
    const result = await Task.deleteMany({
      createdBy: req.user,
      status: 'completed'
    });
    res.json({
      message: "All completed tasks have been cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id — Update a task
router.put('/:id', async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.createdBy.toString() !== req.user) {
      return res.status(401).json({ message: "Not authorized to update this task" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.createdBy.toString() !== req.user) {
      return res.status(401).json({ message: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;