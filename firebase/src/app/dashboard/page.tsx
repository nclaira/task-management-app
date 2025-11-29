// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  userEmail: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'userEmail'>>({ 
    title: '', 
    description: '', 
    priority: 'Medium', 
    completed: false 
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const router = useRouter();

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Fetch tasks for the logged-in user
        const q = query(
          collection(db, 'tasks'),
          where('userEmail', '==', user.email)
        );

        const unsubscribeTasks = onSnapshot(q, (querySnapshot) => {
          const tasksData: Task[] = [];
          querySnapshot.forEach((doc) => {
            tasksData.push({ id: doc.id, ...doc.data() } as Task);
          });
          setTasks(tasksData);
        });

        return () => unsubscribeTasks();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'completed' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingTask) {
        // Update existing task
        const taskRef = doc(db, 'tasks', editingTask);
        await updateDoc(taskRef, {
          ...formData,
          userEmail: user.email,
          updatedAt: Timestamp.now()
        });
        setEditingTask(null);
      } else {
        // Add new task
        await addDoc(collection(db, 'tasks'), {
          ...formData,
          userEmail: user.email,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      
      // Reset form
      setFormData({ 
        title: '', 
        description: '', 
        priority: 'Medium', 
        completed: false 
      });
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task.id);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority as Priority,
      completed: task.completed
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-6xl font-bold text-yellow-600 mb-2">Task Dashboard</h1>
            <p className="text-gray-400 text-2xl">Welcome back, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Task Form */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-6">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border p-4 rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              required
            />
            
            <textarea
              name="description"
              placeholder="Task Description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border p-4 rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />

            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full border p-4 rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <div className="flex items-center space-x-3">
              <input
                id="completed"
                name="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={handleInputChange}
                className="h-5 w-5 text-yellow-600 rounded"
              />
              <label htmlFor="completed" className="text-gray-700 font-medium text-xl">
                Mark as completed
              </label>
            </div>

            <div className="flex space-x-4">
              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setFormData({ 
                      title: '', 
                      description: '', 
                      priority: 'Medium', 
                      completed: false 
                    });
                  }}
                  className="flex-1 bg-gray-400 text-white p-4 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-slate-600 text-white text-xl p-4 rounded-lg hover:bg-slate-700 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Your Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="text-center text-2xl py-12">
              <p className="text-gray-500 text-2xl">No tasks yet. Add your first task!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-lg border-l-4 text-lg ${
                    task.priority === 'High' ? 'border-red-500 bg-red-50' : 
                    task.priority === 'Medium' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="mt-1 h-5 w-5 text-yellow-600 rounded"
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                            task.priority === 'High' ? 'bg-red-200 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            {task.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}