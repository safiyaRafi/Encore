import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, CheckCircle, Circle, Clock, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // New task and editing task state
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  
  // Query params state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchTasks = async () => {
    setFetchError(null);
    try {
      const params = {
        page,
        limit: 10,
        status: status || undefined,
        priority: priority || undefined,
        sortBy,
        order,
        search: search || undefined
      };
      
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotalTasks(res.data.pagination.total);
    } catch (err) {
      console.error('fetchTasks error:', err);
      setFetchError(err.response?.data?.error || 'Failed to load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 300); // Small debounce for search
    return () => clearTimeout(timeoutId);
  }, [page, status, priority, sortBy, order, search]);

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/tasks', newTask);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (err) {
      if (err.response?.data?.fields) {
        const fieldErrors = Object.entries(err.response.data.fields)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setFormError(fieldErrors);
      } else {
        setFormError(err.response?.data?.error || 'Failed to create task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.put(`/tasks/${editingTask.id}`, editingTask);
      setIsEditModalOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      if (err.response?.data?.fields) {
        const fieldErrors = Object.entries(err.response.data.fields)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        setFormError(fieldErrors);
      } else {
        setFormError(err.response?.data?.error || 'Failed to update task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Task Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 font-medium">Hello, {user.name} ({user.role})</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <div className="flex items-center space-x-3">
             <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Task
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={status}
              onChange={(e) => {setStatus(e.target.value); setPage(1);}}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            
            <select 
              value={priority}
              onChange={(e) => {setPriority(e.target.value); setPage(1);}}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select 
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
                setPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="due_date-asc">Due Date (Soonest)</option>
              <option value="priority-desc">Priority (High to Low)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 font-medium">{fetchError}</p>
            <button onClick={fetchTasks} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
              Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <button 
                        onClick={() => handleStatusToggle(task)}
                        className="mr-4 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {task.status === 'done' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium text-indigo-600 truncate ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </p>
                        <p className="flex items-center text-sm text-gray-500 truncate mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="mr-2">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                          {(user.role === 'admin' || task.created_by !== user.id) && (
                            <span className="text-xs text-gray-400 italic">By: {task.created_by_name || 'Admin'}</span>
                          )}
                        </p>
                        {task.description && (
                          <p className="mt-1 text-xs text-gray-400 truncate max-w-lg">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                       <button 
                         onClick={() => openEditModal(task)}
                         className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                         <Edit2 className="h-4 w-4" />
                       </button>
                       {(user.role === 'admin' || task.created_by === user.id) && (
                         <button 
                           onClick={() => handleDelete(task.id)}
                           className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Pagination footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === 1 ? 'opacity-50' : ''}`}
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${page === totalPages ? 'opacity-50' : ''}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing tasks <span className="font-medium">{tasks.length > 0 ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium">{Math.min(page * 10, totalTasks)}</span> of{' '}
                    <span className="font-medium">{totalTasks}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            
            {formError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows={3}
                  maxLength={2000}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date || ''}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-70 transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {isEditModalOpen && editingTask && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
            
            {formError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleEditTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  rows={3}
                  maxLength={2000}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={editingTask.due_date || ''}
                  onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-70 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

