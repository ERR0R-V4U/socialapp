import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

interface Post {
  id: number;
  user_id: number;
  user_name: string;
  user_pic?: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  likes_count: number;
  is_liked: number;
}

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const { token } = useAuth();
  const [liked, setLiked] = useState(post.is_liked === 1);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Like failed', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img 
              src={post.user_pic || 'https://picsum.photos/seed/user/100/100'} 
              className="w-10 h-10 rounded-full object-cover" 
              alt="" 
            />
            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-bold text-sm hover:underline cursor-pointer">{post.user_name}</h4>
                <CheckCircle2 size={14} className="text-black fill-current" />
              </div>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image_url && (
        <img src={post.image_url} className="w-full object-cover max-h-[500px]" alt="" />
      )}
      
      {post.video_url && (
        <video src={post.video_url} controls className="w-full max-h-[500px]" />
      )}

      <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-sm border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 p-1 rounded-full">
            <ThumbsUp size={10} className="text-white fill-current" />
          </div>
          <span>{likesCount}</span>
        </div>
        <div className="flex gap-3">
          <span>0 comments</span>
          <span>0 shares</span>
        </div>
      </div>

      <div className="px-2 py-1 flex items-center justify-between">
        <button 
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm ${liked ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <ThumbsUp size={20} className={liked ? 'fill-current' : ''} />
          <span>Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 font-semibold text-sm">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 font-semibold text-sm">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
