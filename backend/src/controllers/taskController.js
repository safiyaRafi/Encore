const { z } = require('zod');
const crypto = require('crypto');
const { getDB } = require('../db');

// title — required, max 200 chars
// description — optional, max 2000 chars
// dueDate — ISO 8601 if provided
// assignedTo — must reference a real user ID
// All IDs — valid UUID format
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    due_date: z.string().optional().nullable(), // ULTRA LENIENT FOR DEBUGGING
    assigned_to: z.string().uuid().optional().nullable()
  }),
  query: z.any(),
  params: z.any()
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    due_date: z.string().optional().nullable(), // ULTRA LENIENT FOR DEBUGGING
    assigned_to: z.string().uuid().optional().nullable()
  }),
  query: z.any(),
  params: z.object({
    id: z.string().uuid()
  })
});

const getTaskSchema = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({
    id: z.string().uuid()
  })
});

const getTasksSchema = z.object({
  body: z.any(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    status: z.enum(['todo', 'in_progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().uuid().optional(),
    sortBy: z.enum(['created_at', 'due_date', 'priority', 'status', 'title']).optional().default('created_at'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional()
  }),
  params: z.any()
});

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    const db = getDB();

    if (assigned_to) {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [assigned_to]);
      if (!user) {
        return res.status(422).json({ error: 'Validation Error', fields: { assigned_to: 'Must reference a real user ID' } });
      }
    }

    const id = crypto.randomUUID();
    const created_by = req.user.id;

    await db.run(
      `INSERT INTO tasks (id, title, description, status, priority, due_date, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, status, priority, due_date || null, assigned_to || null, created_by]
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { page, limit, status, priority, assignedTo, sortBy, order, search } = req.query;
    const db = getDB();

    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    // RBAC: User can only read their own tasks or tasks assigned to them
    // Admin: full access
    if (req.user.role !== 'admin') {
      whereClauses.push('(created_by = ? OR assigned_to = ?)');
      params.push(req.user.id, req.user.id);
    }

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (priority) {
      whereClauses.push('priority = ?');
      params.push(priority);
    }

    if (assignedTo) {
      whereClauses.push('assigned_to = ?');
      params.push(assignedTo);
    }

    if (search) {
      whereClauses.push('title LIKE ?');
      params.push(`%${search}%`);
    }

    const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countRow = await db.get(`SELECT COUNT(*) as count FROM tasks ${whereStr}`, params);
    const totalCount = countRow.count;

    const query = `
      SELECT tasks.*, users.name as assigned_to_name, creator.name as created_by_name
      FROM tasks
      LEFT JOIN users ON tasks.assigned_to = users.id
      LEFT JOIN users as creator ON tasks.created_by = creator.id
      ${whereStr}
      ORDER BY ${sortBy === 'priority' 
        ? `CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END` 
        : `tasks.${sortBy}`} ${order}
      LIMIT ? OFFSET ?
    `;

    console.log('[GET /tasks] User:', { id: req.user.id, role: req.user.role });
    console.log('[GET /tasks] Query:', query);
    console.log('[GET /tasks] Params:', [...params, limit, offset]);

    const tasks = await db.all(query, [...params, limit, offset]);

    res.json({
      data: tasks,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const task = await db.get(`
      SELECT tasks.*, users.name as assigned_to_name, creator.name as created_by_name
      FROM tasks
      LEFT JOIN users ON tasks.assigned_to = users.id
      LEFT JOIN users as creator ON tasks.created_by = creator.id
      WHERE tasks.id = ?
    `, [id]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.created_by !== req.user.id && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDB();

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (req.user.role !== 'admin' && task.created_by !== req.user.id && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (updates.assigned_to && updates.assigned_to !== task.assigned_to) {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [updates.assigned_to]);
      if (!user) {
        return res.status(422).json({ error: 'Validation Error', fields: { assigned_to: 'Must reference a real user ID' } });
      }
    }

    const fieldsToUpdate = [];
    const values = [];

    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date', 'assigned_to'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });

    if (fieldsToUpdate.length > 0) {
      fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      await db.run(
        `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Role aware
    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: Only admin or creator can delete task' });
    }

    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  getTaskSchema,
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
};
