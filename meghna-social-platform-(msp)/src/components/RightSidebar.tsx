import React from 'react';
import { Video, Search, MoreHorizontal } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const contacts = [
    { name: 'MD NIJUM HOSSAIN', status: 'online', pic: 'https://picsum.photos/seed/nijum/40/40' },
    { name: 'John Doe', status: 'online', pic: 'https://picsum.photos/seed/john/40/40' },
    { name: 'Jane Smith', status: 'offline', pic: 'https://picsum.photos/seed/jane/40/40' },
    { name: 'Alice Johnson', status: 'online', pic: 'https://picsum.photos/seed/alice/40/40' },
    { name: 'Bob Wilson', status: 'online', pic: 'https://picsum.photos/seed/bob/40/40' },
  ];

  return (
    <div className="fixed right-0 top-14 bottom-0 w-64 lg:w-80 overflow-y-auto p-4 hidden xl:block">
      <div className="flex items-center justify-between text-gray-500 mb-4">
        <h3 className="font-semibold">Contacts</h3>
        <div className="flex gap-4">
          <Video size={18} className="cursor-pointer hover:text-gray-700" />
          <Search size={18} className="cursor-pointer hover:text-gray-700" />
          <MoreHorizontal size={18} className="cursor-pointer hover:text-gray-700" />
        </div>
      </div>

      <div className="space-y-2">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer relative">
            <div className="relative">
              <img src={contact.pic} className="w-8 h-8 rounded-full object-cover" alt={contact.name} />
              {contact.status === 'online' && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <span className="text-sm font-medium">{contact.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-300">
        <h3 className="text-gray-500 font-semibold mb-4">Group Conversations</h3>
        <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
          <div className="bg-gray-200 rounded-full p-2">
            <Search size={16} />
          </div>
          <span className="text-sm font-medium text-gray-500">Create New Group</span>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
