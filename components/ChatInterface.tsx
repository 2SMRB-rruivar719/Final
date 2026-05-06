import React, { useState } from 'react';
import { UserProfile, ChatThreadType, Message, LanguageCode } from '../types';
import { ChevronLeft, Send, Phone, Video } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ToastProvider';

interface ChatInterfaceProps {
  currentUser: UserProfile;
  language: LanguageCode;
}

const INITIAL_CHATS: ChatThreadType[] = [
  {
    id: '1',
    name: 'Grupo: Viaje a Japón',
    avatarUrl: 'https://picsum.photos/seed/japan/300/300',
    lastMessage: '¿Ya reservaron el hotel?',
    lastMessageTime: '10:30',
    unread: 2,
    isGroup: true,
    messages: [
      { id: 'm1', text: '¡Hola a todos! ¿Emocionados por el viaje?', sender: 'them', timestamp: '10:00' },
      { id: 'm2', text: '¡Sí! Ya tengo mis pasajes.', sender: 'me', timestamp: '10:05' },
      { id: 'm3', text: '¿Ya reservaron el hotel?', sender: 'them', timestamp: '10:30' }
    ]
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    avatarUrl: 'https://picsum.photos/seed/carlos/300/300',
    lastMessage: 'Me encanta la idea de ir a Kioto.',
    lastMessageTime: 'Ayer',
    unread: 0,
    isGroup: false,
    messages: [
      { id: 'c1', text: 'Vi que también quieres ir a Kioto.', sender: 'them', timestamp: 'Yesterday' },
      { id: 'c2', text: '¡Sí! Es mi parte favorita del plan.', sender: 'me', timestamp: 'Yesterday' },
      { id: 'c3', text: 'Me encanta la idea de ir a Kioto.', sender: 'them', timestamp: 'Yesterday' }
    ]
  },
  {
    id: '3',
    name: 'Sarah Miller',
    avatarUrl: 'https://picsum.photos/seed/sarah/300/300',
    lastMessage: '¡Hola! Vi que coincidimos en fechas.',
    lastMessageTime: 'Ayer',
    unread: 1,
    isGroup: false,
    messages: [
      { id: 's1', text: '¡Hola! Vi que coincidimos en fechas.', sender: 'them', timestamp: 'Yesterday' }
    ]
  },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, language }) => {
  const t = language === 'en'
    ? {
        messages: 'Messages',
        activeChats: 'active chats',
        online: 'Online',
        inputPlaceholder: 'Write a message...',
        sent: 'Message sent.',
        openingChat: 'Opening chat with',
        now: 'Now',
      }
    : {
        messages: 'Mensajes',
        activeChats: 'chats activos',
        online: 'En línea',
        inputPlaceholder: 'Escribe un mensaje...',
        sent: 'Mensaje enviado.',
        openingChat: 'Abriendo chat con',
        now: 'Ahora',
      };
  const [chats, setChats] = useState<ChatThreadType[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { showToast } = useToast();

  const activeChat = chats.find(c => c.id === activeChatId);
  const desktopActiveChat = activeChat || chats[0] || null;

  const handleSend = () => {
    const targetChatId = activeChatId || chats[0]?.id;
    if (!newMessage.trim() || !targetChatId) return;

    console.log('[FLOW] Enviar mensaje de chat', { chatId: targetChatId, text: newMessage });

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === targetChatId) {
        return {
          ...chat,
          lastMessage: newMessage,
          lastMessageTime: t.now,
          messages: [
            ...chat.messages,
            {
              id: `msg-${Date.now()}`,
              text: newMessage,
              sender: 'me',
              timestamp: t.now
            }
          ]
        };
      }
      return chat;
    }));
    setNewMessage('');
    showToast(t.sent, 'info');
  };

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-4rem)] p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-white">
            <h1 className="text-2xl font-bold text-travel-dark">{t.messages}</h1>
            <p className="text-sm text-gray-500">{currentUser.destination} · {chats.length} {t.activeChats}</p>
          </div>
          <div className="h-[calc(100%-92px)] overflow-y-auto">
            {chats.map((chat) => {
              const isSelected = (activeChatId || chats[0]?.id) === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? 'bg-travel-secondary/35' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={chat.avatarUrl}
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
                      <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {desktopActiveChat && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 border-b border-gray-100">
              <img src={desktopActiveChat.avatarUrl} alt={desktopActiveChat.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{desktopActiveChat.name}</h3>
                <span className="text-xs text-green-500 font-medium">{t.online}</span>
              </div>
              <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Phone size={20} /></button>
              <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Video size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
              {desktopActiveChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-travel-primary text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.inputPlaceholder}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-travel-primary/50 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="w-10 h-10 bg-travel-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-opacity-90 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {activeChatId && activeChat ? (
        <div className="lg:hidden flex flex-col h-full bg-gray-50 max-w-2xl mx-auto h-screen pb-20">
          <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
            <button onClick={() => setActiveChatId(null)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{activeChat.name}</h3>
              <span className="text-xs text-green-500 font-medium">{t.online}</span>
            </div>
            <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Phone size={20} /></button>
            <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Video size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChat.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl ${
                  msg.sender === 'me'
                    ? 'bg-travel-primary text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.inputPlaceholder}
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-travel-primary/50 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-travel-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-opacity-90 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="lg:hidden flex flex-col h-full bg-white max-w-2xl mx-auto shadow-sm min-h-screen">
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-travel-dark">{t.messages}</h1>
          </div>

          <div className="flex-1 overflow-y-auto pb-24">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  console.log('[FLOW] Abrir conversación', { chatId: chat.id, name: chat.name });
                  showToast(`${t.openingChat} ${chat.name}`, 'info');
                  setActiveChatId(chat.id);
                }}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={chat.avatarUrl}
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
                    <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};