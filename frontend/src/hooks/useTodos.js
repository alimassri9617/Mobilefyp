import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/AuthStore';
import axios from 'axios';

export const useTodos = () => {
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState([]);

  const token = useAuthStore((state) => state.authUser?.token);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/todo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(token);
      if (!res.ok) throw new Error(data.message || 'Failed to fetch todos');
      setTodos(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Fetch error', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData) => {
    try {
      // Validate required fields here or ensure UI forces it
      if (!todoData.title || !todoData.date || !todoData.priority) {
        Toast.show({
          type: 'error',
          text1: 'Validation error',
          text2: 'Title, date and priority are required.',
        });
        return;
      }

      const payload = {
        title: todoData.title,
        description: todoData.description || '',
        date: todoData.date,
        startTime: todoData.startTime || null,
        endTime: todoData.endTime || null,
        completed: todoData.completed ?? false,
        priority: todoData.priority, // Must be "Top", "Moderate", or "Low"
      };

      const res = await fetch(`${process.env.API_BASE_URL}/todo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create todo');

      setTodos((prev) => [...prev, data]);
      Toast.show({ type: 'success', text1: 'Todo created' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Create error', text2: error.message });
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const res = await axios.put(`${process.env.API_BASE_URL}/todo/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state instantly
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? res.data : todo))
      );
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update todo');
    }
  };

  const deleteTodo = async (todoId) => {
    try {
      const res = await fetch(`${process.env.API_BASE_URL}/todo/${todoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete todo');
      }

      setTodos((prev) => prev.filter((todo) => todo._id !== todoId));
      Toast.show({ type: 'success', text1: 'Todo deleted' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Delete error', text2: error.message });
    }
  };

  return {
    loading,
    todos,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
};
