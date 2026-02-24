import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import db from './src/db.ts';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'msp-super-secret-key';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- Auth Routes ---
  app.post('/api/auth/register', async (req, res) => {
    const { name, dob, email, phone, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, dob, email, phone, password) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(name, dob, email, phone, hashedPassword);
      
      const user = { id: result.lastInsertRowid, name, email, is_admin: 0 };
      const token = jwt.sign(user, JWT_SECRET);
      res.json({ token, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, profile_pic: user.profile_pic } });
  });

  // --- User Routes ---
  app.get('/api/users/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, dob, phone, profile_pic, cover_photo, is_verified, is_admin FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  app.get('/api/users/:id', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, dob, phone, profile_pic, cover_photo, is_verified, is_admin FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  });

  app.post('/api/users/profile', authenticateToken, upload.fields([{ name: 'profile_pic', maxCount: 1 }, { name: 'cover_photo', maxCount: 1 }]), (req: any, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const profilePic = files['profile_pic'] ? `/uploads/${files['profile_pic'][0].filename}` : null;
    const coverPhoto = files['cover_photo'] ? `/uploads/${files['cover_photo'][0].filename}` : null;

    if (profilePic) {
      db.prepare('UPDATE users SET profile_pic = ? WHERE id = ?').run(profilePic, req.user.id);
    }
    if (coverPhoto) {
      db.prepare('UPDATE users SET cover_photo = ? WHERE id = ?').run(coverPhoto, req.user.id);
    }

    res.json({ success: true, profile_pic: profilePic, cover_photo: coverPhoto });
  });

  // --- Post Routes ---
  app.get('/api/posts', authenticateToken, (req: any, res) => {
    const posts = db.prepare(`
      SELECT posts.*, users.name as user_name, users.profile_pic as user_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
      (SELECT COUNT(*) FROM likes WHERE post_id = posts.id AND user_id = ?) as is_liked
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
    `).all(req.user.id);
    res.json(posts);
  });

  app.post('/api/posts', authenticateToken, upload.single('media'), (req: any, res) => {
    const { content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const isVideo = req.file && req.file.mimetype.startsWith('video/');
    
    const stmt = db.prepare('INSERT INTO posts (user_id, content, image_url, video_url) VALUES (?, ?, ?, ?)');
    stmt.run(req.user.id, content, isVideo ? null : mediaUrl, isVideo ? mediaUrl : null);
    res.json({ success: true });
  });

  app.post('/api/posts/:id/like', authenticateToken, (req: any, res) => {
    try {
      db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(req.params.id, req.user.id);
      res.json({ liked: true });
    } catch (e) {
      db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(req.params.id, req.user.id);
      res.json({ liked: false });
    }
  });

  // --- Chat Routes ---
  app.get('/api/messages/:userId', authenticateToken, (req: any, res) => {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(req.user.id, req.params.userId, req.params.userId, req.user.id);
    res.json(messages);
  });

  app.get('/api/conversations', authenticateToken, (req: any, res) => {
    const conversations = db.prepare(`
      SELECT DISTINCT users.id, users.name, users.profile_pic
      FROM users
      JOIN messages ON (users.id = messages.sender_id OR users.id = messages.receiver_id)
      WHERE (messages.sender_id = ? OR messages.receiver_id = ?) AND users.id != ?
    `).all(req.user.id, req.user.id, req.user.id);
    res.json(conversations);
  });

  // --- Admin Routes ---
  app.get('/api/admin/stats', authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.sendStatus(403);
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
    res.json({ userCount, postCount });
  });

  app.get('/api/admin/users', authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.sendStatus(403);
    const users = db.prepare('SELECT id, name, email, is_verified, is_admin, created_at FROM users').all();
    res.json(users);
  });

  app.delete('/api/admin/users/:id', authenticateToken, (req: any, res) => {
    if (!req.user.is_admin) return res.sendStatus(403);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- WebSocket for Real-time Chat ---
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: number | null = null;

    ws.on('message', (message) => {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'auth') {
        userId = data.userId;
        if (userId) clients.set(userId, ws);
      } else if (data.type === 'message') {
        const { receiverId, content, imageUrl } = data;
        if (userId && receiverId) {
          const stmt = db.prepare('INSERT INTO messages (sender_id, receiver_id, content, image_url) VALUES (?, ?, ?, ?)');
          const result = stmt.run(userId, receiverId, content, imageUrl);
          
          const msgData = {
            type: 'message',
            id: result.lastInsertRowid,
            senderId: userId,
            receiverId,
            content,
            imageUrl,
            created_at: new Date().toISOString()
          };

          // Send to receiver if online
          const receiverWs = clients.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify(msgData));
          }
          
          // Send back to sender for confirmation
          ws.send(JSON.stringify(msgData));
        }
      }
    });

    ws.on('close', () => {
      if (userId) clients.delete(userId);
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
