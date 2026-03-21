import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export const attachSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // In production this should securely match the frontend URL
      methods: ["GET", "POST"]
    }
  });

  const socketToRoom = new Map<string, string>();

  io.on('connection', (socket: Socket) => {
    console.log('User connected to socket:', socket.id);

    // 1. Join Session Room
    socket.on('join-session', (sessionId: string) => {
      socket.join(sessionId);
      socketToRoom.set(socket.id, sessionId);
      console.log(`User ${socket.id} joined session room: ${sessionId}`);
    });

    // 2. Code Sync
    socket.on('code-change', (data: { sessionId: string; code: string; language: string }) => {
      // socket.to(room).emit sends to everyone in the room EXCEPT the sender
      socket.to(data.sessionId).emit('code-change', {
        code: data.code,
        language: data.language
      });
    });

    // 3. Chat Messages Sync
    socket.on('send-message', (data: { sessionId: string; message: any }) => {
      socket.to(data.sessionId).emit('receive-message', data.message);
    });

    // 4. WebRTC Signaling Events
    socket.on('user-joined', (sessionId: string) => {
      // Let the other person in the room know someone arrived so they can initiate the WebRTC Offer
      socket.to(sessionId).emit('user-joined', socket.id);
    });

    socket.on('webrtc-offer', (data: { sessionId: string; offer: RTCSessionDescriptionInit }) => {
      socket.to(data.sessionId).emit('webrtc-offer', data.offer);
    });

    socket.on('webrtc-answer', (data: { sessionId: string; answer: RTCSessionDescriptionInit }) => {
      socket.to(data.sessionId).emit('webrtc-answer', data.answer);
    });

    socket.on('webrtc-ice-candidate', (data: { sessionId: string; candidate: RTCIceCandidateInit }) => {
      socket.to(data.sessionId).emit('webrtc-ice-candidate', data.candidate);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
      const sessionId = socketToRoom.get(socket.id);
      if (sessionId) {
        // Tell the other person the peer left
        socket.to(sessionId).emit('peer-disconnected', socket.id);
        socketToRoom.delete(socket.id);
      }
    });
  });

  return io;
};
