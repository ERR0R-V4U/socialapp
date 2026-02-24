import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ChatWindow from '../components/ChatWindow';
import { Search, Settings, Edit } from 'lucide-react';

const Messages: React.FC = () => {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setConversations(data));
  }, [token]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navbar />
      <div className="flex-1 pt-14 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <div className="w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Chats</h2>
            <div className="flex gap-2">
              <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200">
                <Settings size={20} />
              </div>
              <div className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200">
                <Edit size={20} />
              </div>
            </div>
          </div>
          
          <div className="px-4 mb-4">
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
              <Search size={18} className="text-gray-500" />
              <input type="text" placeholder="Search Messenger" className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedUser(conv)}
                className={`flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors ${selectedUser?.id === conv.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              >
                <img src={conv.profile_pic || 'https://picsum.photos/seed/user/50/50'} className="w-14 h-14 rounded-full object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{conv.name}</h4>
                  <p className="text-xs text-gray-500 truncate">You sent a message</p>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No conversations yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <ChatWindow selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default Messages;
