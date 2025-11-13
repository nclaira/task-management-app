'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from './lib/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  userEmail: string;
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
          userEmail: user.email
        });
        setEditingTask(null);
      } else {
        // Add new task
        await addDoc(collection(db, 'tasks'), {
          ...formData,
          userEmail: user.email
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
        completed: !task.completed
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Task Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="completed"
                name="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="completed" className="ml-2 block text-sm text-gray-700">
                Completed
              </label>
            </div>

            <div className="flex justify-end space-x-3">
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
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-500">No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                    task.priority === 'High' ? 'border-red-500' : 
                    task.priority === 'Medium' ? 'border-yellow-500' : 'border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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