import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../store/AuthStore';
import { useSocketStore } from '../store/SocketStore';

export const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { clearAuth } = useAuthStore();
  const { disconnectSocket } = useSocketStore();

  const logout = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Clear local storage and disconnect socket
      clearAuth();
      disconnectSocket();
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'See you next time!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, logout };
};

