import React from 'react';
import { Search, Home, Users, MessageSquare, Bell, Menu, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-blue-600 font-black text-2xl tracking-tighter">MSP</Link>
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 ml-2">
          <Search size={18} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="Search MSP" 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 lg:w-64"
          />
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 lg:gap-12">
        <Link to="/" className="text-blue-600 border-b-4 border-blue-600 h-14 flex items-center px-4">
          <Home size={28} />
        </Link>
        <Link to="/friends" className="text-gray-500 hover:bg-gray-100 h-12 w-16 flex items-center justify-center rounded-xl transition-colors">
          <Users size={28} />
        </Link>
        <Link to="/messages" className="text-gray-500 hover:bg-gray-100 h-12 w-16 flex items-center justify-center rounded-xl transition-colors">
          <MessageSquare size={28} />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user?.is_admin && (
          <Link to="/admin" className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200" title="Admin Panel">
            <ShieldCheck size={20} />
          </Link>
        )}
        <div className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 relative cursor-pointer">
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">3</span>
        </div>
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="p-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
        <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 ml-2 hover:bg-gray-100 p-1 rounded-full pr-3">
          <img 
            src={user?.profile_pic || 'https://picsum.photos/seed/user/100/100'} 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <span className="text-sm font-semibold hidden lg:block">{user?.name.split(' ')[0]}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
