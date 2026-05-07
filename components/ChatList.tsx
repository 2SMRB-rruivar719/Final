import React from 'react';
import { UserProfile } from '../types';
import { Circle, ChevronRight } from 'lucide-react';
import { getAvatarByName } from '../services/avatarByName';

interface ChatListProps {
  currentUser: UserProfile;
}

const MOCK_CHATS = [
  { id: '1', name: 'Grupo: Viaje a Japón', lastMessage: '¿Ya reservaron el hotel?', time: '10:30', unread: 2, isGroup: true, img: 'https://picsum.photos/seed/japan/100/100' },
  { id: '2', name: 'Carlos Ruiz', lastMessage: 'Me encanta la idea de ir a Kioto.', time: 'Ayer', unread: 0, isGroup: false, img: getAvatarByName('Carlos Ruiz') },
  { id: '3', name: 'Sarah Miller', lastMessage: '¡Hola! Vi que coincidimos en fechas.', time: 'Ayer', unread: 1, isGroup: false, img: getAvatarByName('Sarah Miller') },
];

export const ChatList: React.FC<ChatListProps> = () => {
  return (
    <div className="flex flex-col h-full bg-white max-w-2xl mx-auto shadow-sm min-h-screen">
      <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-travel-dark">Mensajes</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-24">
        {MOCK_CHATS.map((chat) => (
          <div key={chat.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer">
            <div className="relative">
              <img 
                src={chat.img} 
                alt={chat.name} 
                className={`w-14 h-14 object-cover ${chat.isGroup ? 'rounded-xl' : 'rounded-full'}`} 
              />
              {chat.unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-travel-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {chat.unread}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-gray-800 truncate">{chat.name}</h3>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {chat.lastMessage}
              </p>
            </div>
            
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};