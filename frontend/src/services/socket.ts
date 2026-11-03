import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getAuthToken } from './api';

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  const token = await getAuthToken();

  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected to LinkHub Real-Time Server:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO Connection Error]', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO Disconnected]:', reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
