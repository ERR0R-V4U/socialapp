import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'amar-social-secret-key-2026';

// Database Setup
const db = new Database('amar_social.db');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    dob TEXT NOT NULL,
    bio TEXT,
    profile_pic TEXT,
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    is_admin INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

// Seed Admin if not exists
const adminEmail = 'admin@amarsocial.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (full_name, email, password, dob, is_admin, is_verified) VALUES (?, ?, ?, ?, ?, ?)').run(
    'MD NIJUM Hossain',
    adminEmail,
    hashedPassword,
    '1990-01-01',
    1,
    1
  );
}

app.use(express.json());

// Middleware for Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, dob } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.random().toString(36).substring(2, 15);
    
    const result = db.prepare('INSERT INTO users (full_name, email, password, dob, verification_token) VALUES (?, ?, ?, ?, ?)').run(
      fullName, email, hashedPassword, dob, verificationToken
    );
    
    // In a real app, send email here. For now, we'll simulate it.
    console.log(`Verification link for ${email}: http://localhost:3000/api/auth/verify/${verificationToken}`);
    
    res.status(201).json({ message: 'User created. Please verify your email.', userId: result.lastInsertRowid });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify/:token', (req, res) => {
  const { token } = req.params;
  const user = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
  
  if (!user) return res.status(400).send('Invalid token');
  
  db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);
  res.send('Email verified successfully! You can now login.');
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user) return res.status(400).json({ error: 'User not found' });
  if (!user.is_verified) return res.status(400).json({ error: 'Please verify your email first' });
  if (user.is_blocked) return res.status(403).json({ error: 'Your account is blocked' });
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, JWT_SECRET);
  res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, isAdmin: user.is_admin } });
});

// --- USER ROUTES ---

app.get('/api/users/me', authenticateToken, (req, res) => {
  const user: any = db.prepare('SELECT id, full_name, email, dob, bio, profile_pic, is_admin FROM users WHERE id = ?').get((req as any).user.id);
  if (user) {
    res.json({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      dob: user.dob,
      bio: user.bio,
      profilePic: user.profile_pic,
      isAdmin: user.is_admin
    });
  } else {
    res.sendStatus(404);
  }
});

app.put('/api/users/me', authenticateToken, (req, res) => {
  const { fullName, bio, profilePic } = req.body;
  db.prepare('UPDATE users SET full_name = ?, bio = ?, profile_pic = ? WHERE id = ?').run(
    fullName, bio, profilePic, (req as any).user.id
  );
  res.json({ message: 'Profile updated' });
});

app.get('/api/users/search', authenticateToken, (req, res) => {
  const { q } = req.query;
  const users = db.prepare('SELECT id, full_name, profile_pic FROM users WHERE full_name LIKE ? AND is_admin = 0 LIMIT 10').all(`%${q}%`);
  res.json(users);
});

// --- POST ROUTES ---

app.get('/api/posts', authenticateToken, (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.full_name, u.profile_pic,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all((req as any).user.id);
  res.json(posts);
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const { content } = req.body;
  const result = db.prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)').run((req as any).user.id, content);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const post: any = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.user_id !== (req as any).user.id && !(req as any).user.isAdmin) return res.status(403).json({ error: 'Unauthorized' });
  
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post deleted' });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  try {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run((req as any).user.id, req.params.id);
    res.json({ liked: true });
  } catch (e) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run((req as any).user.id, req.params.id);
    res.json({ liked: false });
  }
});

app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.full_name, u.profile_pic
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);
  res.json(comments);
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  db.prepare('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)').run((req as any).user.id, req.params.id, content);
  res.status(201).json({ message: 'Comment added' });
});

// --- MESSAGE ROUTES ---

app.get('/api/messages/:userId', authenticateToken, (req, res) => {
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all((req as any).user.id, req.params.userId, req.params.userId, (req as any).user.id);
  res.json(messages);
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { receiverId, content } = req.body;
  db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run((req as any).user.id, receiverId, content);
  res.status(201).json({ message: 'Message sent' });
});

// --- ADMIN ROUTES ---

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (!(req as any).user.isAdmin) return res.sendStatus(403);
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0').get();
  const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get();
  res.json({ totalUsers: totalUsers.count, totalPosts: totalPosts.count });
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (!(req as any).user.isAdmin) return res.sendStatus(403);
  const users = db.prepare('SELECT id, full_name, email, is_blocked, created_at FROM users WHERE is_admin = 0').all();
  res.json(users);
});

app.put('/api/admin/users/:id/block', authenticateToken, (req, res) => {
  if (!(req as any).user.isAdmin) return res.sendStatus(403);
  const { isBlocked } = req.body;
  db.prepare('UPDATE users SET is_blocked = ? WHERE id = ?').run(isBlocked ? 1 : 0, req.params.id);
  res.json({ message: isBlocked ? 'User blocked' : 'User unblocked' });
});

app.delete('/api/admin/users/:id', authenticateToken, (req, res) => {
  if (!(req as any).user.isAdmin) return res.sendStatus(403);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// --- VITE MIDDLEWARE ---

async function startServer() {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
