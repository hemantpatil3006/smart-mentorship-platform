import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { attachSocketServer } from './socket';
import { requireAuth, AuthRequest } from './middleware/auth';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Expose underlying HTTP server to attach Socket.io
const server = http.createServer(app);
attachSocketServer(server);

// Middleware
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mentorship Platform API is running.' });
});

app.get('/api/profile', requireAuth, (req: AuthRequest, res) => {
  res.json({ 
    message: 'Protected route accessed successfully', 
    user: req.user 
  });
});

// Register session routes
app.use('/api/sessions', sessionRoutes);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
