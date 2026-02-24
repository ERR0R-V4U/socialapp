import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { useAuth } from '../context/AuthContext';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="max-w-[680px] mx-auto pt-4 px-2">
      <CreatePost onPostCreated={fetchPosts} />
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center text-gray-500 shadow-sm">
              <p className="font-semibold">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;
