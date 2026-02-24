import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Image as ImageIcon, Smile, Phone, Video, Info, MoreHorizontal, Plus } from 'lucide-react';

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  imageUrl?: string;
  created_at: string;
}

const ChatWindow: React.FC<{ selectedUser: any }> = ({ selectedUser }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedUser) return;

    // Fetch message history
    fetch(`/api/messages/${selectedUser.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMessages(data));

    // WebSocket setup
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'auth', userId: user?.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        if (data.senderId === selectedUser.id || data.senderId === user?.id) {
          setMessages(prev => [...prev, data]);
        }
      }
    };

    setWs(socket);
    return () => socket.close();
  }, [selectedUser, user?.id, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !ws) return;
    ws.send(JSON.stringify({
      type: 'message',
      receiverId: selectedUser.id,
      content: input
    }));
    setInput('');
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Send size={48} />
        </div>
        <h3 className="text-xl font-bold text-black">Your Messages</h3>
        <p>Send private photos and messages to a friend.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={selectedUser.profile_pic || 'https://picsum.photos/seed/user/40/40'} className="w-10 h-10 rounded-full object-cover" alt="" />
          <div>
            <h4 className="font-bold text-sm leading-tight">{selectedUser.name}</h4>
            <p className="text-xs text-green-500 font-medium">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-blue-600">
          <Phone size={20} className="cursor-pointer" />
          <Video size={22} className="cursor-pointer" />
          <Info size={22} className="cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-black rounded-bl-none'}`}>
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <div className="flex gap-2 text-blue-600">
            <Plus size={20} className="cursor-pointer" />
            <ImageIcon size={20} className="cursor-pointer" />
            <Smile size={20} className="cursor-pointer" />
          </div>
          <input 
            type="text" 
            placeholder="Aa" 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="text-blue-600">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
