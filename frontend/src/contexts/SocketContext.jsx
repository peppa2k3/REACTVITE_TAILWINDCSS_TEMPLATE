import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { URL_Socket } from './../env/apiURL';
const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  console.log(context);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      console.log(token, user);
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }
    console.log(URL_Socket);

    const socketInstance = io(URL_Socket || 'http://localhost:5000', {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    socketInstance.on('connect_error', (err) => {
      console.log('Socket connect error:', err.message);
    });
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, user]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId),
  };
  console.log('SocketContext is ok');
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
