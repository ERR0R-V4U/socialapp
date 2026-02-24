import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Users, FileText, Trash2, Shield, BarChart3, Bell } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
      } catch (error) {
        console.error('Admin fetch failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  if (!currentUser?.is_admin) return <div className="pt-20 text-center">Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 font-medium">Owner: MD NIJUM HOSSAIN</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Users</p>
                <h2 className="text-3xl font-bold">{stats?.userCount || 0}</h2>
              </div>
              <Users size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Posts</p>
                <h2 className="text-3xl font-bold">{stats?.postCount || 0}</h2>
              </div>
              <FileText size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Analytics</p>
                <h2 className="text-3xl font-bold">Active</h2>
              </div>
              <BarChart3 size={32} className="text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Reports</p>
                <h2 className="text-3xl font-bold">0</h2>
              </div>
              <Bell size={32} className="text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold">User Management</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">
              Send Platform Announcement
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {u.name[0]}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                        {u.is_admin === 1 && <span className="bg-blue-100 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-600 text-[10px] px-2 py-1 rounded-full font-bold">VERIFIED</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Shield size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
