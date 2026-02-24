/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  User, 
  LogOut, 
  Search, 
  PlusSquare, 
  Settings, 
  Shield, 
  Trash2, 
  Lock,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONTEXT ---
const AuthContext = createContext<any>(null);

const useAuth = () => useContext(AuthContext);

// --- COMPONENTS ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
      ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, value, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400',
        className
      )}
      value={value ?? ''}
      {...props}
    />
  )
);

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn('rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900', className)} {...props}>
    {children}
  </div>
);

// --- PAGES ---

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-600">amar Social</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Welcome back! Please login to your account.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Login</Button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Don't have an account? <button onClick={() => window.location.hash = '#signup'} className="text-emerald-600 hover:underline">Sign up</button>
        </p>
      </Card>
    </div>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', dob: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('Registration successful! Check console for verification link (simulated).');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-600">amar Social</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Create an account to start connecting.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="John Doe" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email Address</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="name@example.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date of Birth</label>
            <Input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account? <button onClick={() => window.location.hash = '#login'} className="text-emerald-600 hover:underline">Login</button>
        </p>
      </Card>
    </div>
  );
};

const Feed = () => {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');

  const fetchPosts = async () => {
    const res = await fetch('/api/posts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: newPost }),
    });
    setNewPost('');
    fetchPosts();
  };

  const handleLike = async (postId: number) => {
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchPosts();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Card className="p-4">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            className="w-full resize-none rounded-lg border-none bg-transparent p-2 text-lg focus:ring-0 dark:text-white"
            placeholder="What's on your mind?"
            rows={3}
            value={newPost ?? ''}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-end border-t pt-4 dark:border-zinc-800">
            <Button type="submit" disabled={!newPost.trim()}>Post</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{post.full_name}</h3>
                <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(post.created_at))} ago</p>
              </div>
            </div>
            <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            <div className="flex items-center gap-6 border-t pt-4 dark:border-zinc-800">
              <button 
                onClick={() => handleLike(post.id)}
                className={cn("flex items-center gap-2 text-sm transition-colors", post.is_liked ? "text-red-500" : "text-zinc-500 hover:text-red-500")}
              >
                <Heart size={18} fill={post.is_liked ? "currentColor" : "none"} />
                {post.likes_count}
              </button>
              <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-emerald-600">
                <MessageCircle size={18} />
                Comment
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Messages = () => {
  const { token, user } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (search.length > 2) {
      fetch(`/api/users/search?q=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(setUsers);
    } else {
      setUsers([]);
    }
  }, [search]);

  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => {
        fetch(`/api/messages/${selectedUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json()).then(setMessages);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ receiverId: selectedUser.id, content: newMessage }),
    });
    setNewMessage('');
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] max-w-5xl gap-6 py-8">
      <Card className="flex w-80 flex-col overflow-hidden">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <Input 
              className="pl-10" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={cn("flex w-full items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800", selectedUser?.id === u.id && "bg-emerald-50 dark:bg-emerald-900/20")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User size={20} />
              </div>
              <span className="font-medium">{u.full_name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 border-b p-4 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <User size={20} />
              </div>
              <span className="font-bold">{selectedUser.full_name}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={cn("flex", m.sender_id === user.id ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[70%] rounded-2xl px-4 py-2 text-sm", m.sender_id === user.id ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800")}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="border-t p-4 dark:border-zinc-800 flex gap-2">
              <Input 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit"><Send size={18} /></Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-zinc-500">
            Select a user to start messaging
          </div>
        )}
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  const fetchData = async () => {
    const [statsRes, usersRes] = await Promise.all([
      fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    setStats(await statsRes.json());
    setUsers(await usersRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlock = async (userId: number, isBlocked: boolean) => {
    await fetch(`/api/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    fetchData();
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    fetchData();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-emerald-600" /> Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-zinc-500">Total Users</p>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-zinc-500">Total Posts</p>
          <p className="text-3xl font-bold">{stats?.totalPosts || 0}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-6 py-4">{u.full_name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-full px-2 py-1 text-xs font-medium", u.is_blocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                    {u.is_blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleBlock(u.id, u.is_blocked)}>
                    {u.is_blocked ? 'Unblock' : 'Block'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', bio: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) setFormData({ fullName: user.fullName, bio: user.bio || '' });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    if (res.ok) setMessage('Profile updated successfully!');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="p-8">
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
            <User size={48} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.fullName}</h1>
            <p className="text-zinc-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
              rows={4}
              value={formData.bio ?? ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
            />
          </div>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <div className="flex justify-between pt-4">
            <Button type="submit">Save Changes</Button>
            <Button variant="danger" onClick={logout} className="gap-2">
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [page, setPage] = useState('feed');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'feed';
      setPage(hash);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (token) {
      fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) return res.json();
        throw new Error();
      }).then(setUser).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    window.location.hash = '#feed';
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.hash = '#login';
  };

  if (!token) {
    return (
      <AuthContext.Provider value={{ login }}>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100">
          {page === 'signup' ? <Signup /> : <Login />}
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <button onClick={() => window.location.hash = '#feed'} className="text-xl font-bold text-emerald-600">amar Social</button>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => window.location.hash = '#feed'} className={cn("rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800", page === 'feed' && "text-emerald-600")}>
                <Home size={20} />
              </button>
              <button onClick={() => window.location.hash = '#messages'} className={cn("rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800", page === 'messages' && "text-emerald-600")}>
                <MessageCircle size={20} />
              </button>
              {user?.is_admin === 1 && (
                <button onClick={() => window.location.hash = '#admin'} className={cn("rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800", page === 'admin' && "text-emerald-600")}>
                  <Shield size={20} />
                </button>
              )}
              <button onClick={() => window.location.hash = '#profile'} className={cn("rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800", page === 'profile' && "text-emerald-600")}>
                <User size={20} />
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {page === 'feed' && <Feed />}
              {page === 'messages' && <Messages />}
              {page === 'profile' && <Profile />}
              {page === 'admin' && user?.is_admin === 1 && <AdminDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t py-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          <p>© 2026 amar Social | Owned by MD NIJUM HOSSAIN</p>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}
