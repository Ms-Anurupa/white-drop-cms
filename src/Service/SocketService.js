import { io } from 'socket.io-client';
import { SOCKET_URL } from "../ConfigResolver";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      console.log(SOCKET_URL)
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'], // Fallback options
        reconnection: true,
      });

      this.socket.on('connect', () => {
        console.log('Global socket connected:', this.socket.id);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
    }
  }

  joinDriverRoom(driverId) {
    if (!this.socket) return;

    // If socket is already connected, emit immediately
    if (this.socket.connected) {
      console.log(`Emitting joinTrackingRoom for ${driverId}`);
      this.socket.emit('joinTrackingRoom', driverId);
    } else {
      // If still connecting, wait for 'connect' event before emitting
      this.socket.once('connect', () => {
        console.log(`Socket connected. Emitting joinTrackingRoom for ${driverId}`);
        this.socket.emit('joinTrackingRoom', driverId);
      });
    }
  }

  leaveDriverRoom(driverId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leaveTrackingRoom', driverId);
    }
  }

  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('locationUpdate'); 
      this.socket.on('locationUpdate', (data) => {
        console.log('Location update received on React:', data);
        callback(data);
      });
    }
  }

  removeLocationListener() {
    if (this.socket) {
      this.socket.off('locationUpdate');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();