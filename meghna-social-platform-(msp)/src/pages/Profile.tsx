import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Camera, Edit2, Plus, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';

const Profile: React.FC = () => {
  const { id } = useParams();
  const { user: currentUser, token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          fetch(`/api/users/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/posts`, { headers: { 'Authorization': `Bearer ${token}` } }) // Filtered on client for now
        ]);
        const userData = await userRes.json();
        const postsData = await postsRes.json();
        setUser(userData);
        setPosts(postsData.filter((p: any) => p.user_id === parseInt(id!)));
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  if (loading) return <div className="pt-20 text-center">Loading...</div>;
  if (!user) return <div className="pt-20 text-center">User not found</div>;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto">
          {/* Cover Photo */}
          <div className="relative h-48 md:h-80 bg-gray-200 rounded-b-xl overflow-hidden group">
            <img 
              src={user.cover_photo || 'https://picsum.photos/seed/cover/1200/400'} 
              className="w-full h-full object-cover" 
              alt="" 
            />
            {isOwnProfile && (
              <button className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 shadow-md">
                <Camera size={20} />
                <span className="hidden md:inline">Edit Cover Photo</span>
              </button>
            )}
          </div>

          {/* Profile Header Info */}
          <div className="px-4 pb-4">
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16 mb-4">
              <div className="relative group">
                <img 
                  src={user.profile_pic || 'https://picsum.photos/seed/user/200/200'} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover bg-white" 
                  alt="" 
                />
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 border-2 border-white">
                    <Camera size={20} />
                  </button>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left pb-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <CheckCircle2 size={24} className="text-black fill-current" />
                </div>
                <p className="text-gray-500 font-semibold">500 friends</p>
                <div className="flex -space-x-2 mt-2 justify-center md:justify-start">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/${i}/40/40`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pb-2">
                {isOwnProfile ? (
                  <>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700">
                      <Plus size={20} />
                      Add to story
                    </button>
                    <button className="bg-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300">
                      <Edit2 size={20} />
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700">
                      <Plus size={20} />
                      Add Friend
                    </button>
                    <button className="bg-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-300">
                      <MessageSquare size={20} />
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>

            <hr className="border-gray-300" />
            
            <div className="flex gap-1 py-1 overflow-x-auto">
              {['Posts', 'About', 'Friends', 'Photos', 'Videos', 'Check-ins', 'More'].map((tab, i) => (
                <button key={tab} className={`px-4 py-3 font-semibold text-gray-500 hover:bg-gray-100 rounded-lg whitespace-nowrap ${i === 0 ? 'text-blue-600 border-b-4 border-blue-600 rounded-none' : ''}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-4 px-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-xl mb-4">Intro</h3>
            <div className="space-y-3">
              <p className="text-center text-sm">No bio yet.</p>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-semibold text-sm">Edit bio</button>
              <div className="text-sm space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={20} />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-semibold text-sm">Edit details</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">Photos</h3>
              <button className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm font-medium">See all photos</button>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <img key={i} src={`https://picsum.photos/seed/photo${i}/200/200`} className="aspect-square object-cover" alt="" />
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard key={post.id} post={{...post, user_name: user.name, user_pic: user.profile_pic}} />
            ))}
            {posts.length === 0 && (
              <div className="bg-white p-8 rounded-xl text-center text-gray-500 shadow-sm">
                <p className="font-semibold">No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
