import React, { useState, useEffect } from 'react';
import { Image, Video, Smile, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CreatePost: React.FC<{ onPostCreated: () => void }> = ({ onPostCreated }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('media', file);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        setContent('');
        setFile(null);
        onPostCreated();
      }
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex gap-3 mb-4">
        <img 
          src={user?.profile_pic || 'https://picsum.photos/seed/user/100/100'} 
          className="w-10 h-10 rounded-full object-cover" 
          alt="" 
        />
        <button 
          onClick={() => document.getElementById('post-input')?.focus()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2 rounded-full flex-1 transition-colors"
        >
          What's on your mind, {user?.name.split(' ')[0]}?
        </button>
      </div>
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div className="flex gap-1">
          <label className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <Video size={24} className="text-red-500" />
            <span className="text-sm font-semibold text-gray-500">Live Video</span>
          </label>
          <label className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <Image size={24} className="text-green-500" />
            <span className="text-sm font-semibold text-gray-500">Photo/video</span>
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg cursor-pointer transition-colors">
            <Smile size={24} className="text-yellow-500" />
            <span className="text-sm font-semibold text-gray-500">Feeling/activity</span>
          </label>
        </div>
        {(content || file) && (
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        )}
      </div>
      {file && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
          <span className="text-xs text-gray-500 truncate max-w-[200px]">{file.name}</span>
          <button onClick={() => setFile(null)} className="text-red-500 text-xs font-bold">Remove</button>
        </div>
      )}
      <textarea 
        id="post-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="hidden"
      />
    </div>
  );
};

export default CreatePost;
