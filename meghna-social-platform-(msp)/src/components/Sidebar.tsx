import React from 'react';
import { Home, Users, MessageSquare, Bookmark, Clock, ChevronDown, UserCircle, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const items = [
    { icon: <UserCircle size={24} className="text-blue-500" />, label: user?.name, path: `/profile/${user?.id}` },
    { icon: <Users size={24} className="text-blue-500" />, label: 'Friends', path: '/friends' },
    { icon: <Clock size={24} className="text-blue-500" />, label: 'Memories', path: '/memories' },
    { icon: <Bookmark size={24} className="text-purple-500" />, label: 'Saved', path: '/saved' },
    { icon: <MessageSquare size={24} className="text-blue-400" />, label: 'Messenger', path: '/messages' },
    { icon: <Settings size={24} className="text-gray-500" />, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-14 bottom-0 w-64 lg:w-80 overflow-y-auto p-2 hidden md:block">
      <div className="space-y-1">
        {items.map((item, index) => (
          <Link 
            key={index} 
            to={item.path}
            className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
          <div className="bg-gray-200 rounded-full p-1">
            <ChevronDown size={16} />
          </div>
          <span className="font-medium text-sm">See more</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-300 px-2">
        <h3 className="text-gray-500 font-semibold text-sm mb-2">Your Shortcuts</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
            <img src="https://picsum.photos/seed/group1/40/40" className="w-8 h-8 rounded-lg" alt="" />
            <span className="text-sm font-medium">MSP Developers</span>
          </div>
          <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
            <img src="https://picsum.photos/seed/group2/40/40" className="w-8 h-8 rounded-lg" alt="" />
            <span className="text-sm font-medium">Global Community</span>
          </div>
        </div>
      </div>

      <footer className="mt-8 px-2 text-[11px] text-gray-500 leading-tight">
        <p className="hover:underline cursor-pointer inline">Privacy</p> · 
        <p className="hover:underline cursor-pointer inline ml-1">Terms</p> · 
        <p className="hover:underline cursor-pointer inline ml-1">Advertising</p> · 
        <p className="hover:underline cursor-pointer inline ml-1">Ad Choices</p> · 
        <p className="hover:underline cursor-pointer inline ml-1">Cookies</p> · 
        <p className="hover:underline cursor-pointer inline ml-1">More</p>
        <p className="mt-4">© 2026 MEGHNA SOCIAL PLATFORM (MSP) | Owned by MD NIJUM HOSSAIN</p>
      </footer>
    </div>
  );
};

export default Sidebar;
