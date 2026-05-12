import React, { useEffect, useState } from 'react';
import { UserProfile, ChatThreadType, ChatMember, LanguageCode, ThemeMode } from '../types';
import { ChevronLeft, Send, Phone, Video, MapPin, X, Users, Mic, MoreVertical } from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { useToast } from './ToastProvider';
import { getAvatarByName } from '../services/avatarByName';

interface ChatInterfaceProps {
  currentUser: UserProfile;
  language: LanguageCode;
  theme: ThemeMode;
  initialTargetUser?: UserProfile | null;
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
    leaderId: 'current-user',
    members: [
      {
        id: 'gm-1',
        name: 'Kenji Nakamura',
        avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&w=300&q=80',
        age: 31,
        sex: 'hombre',
        destination: 'Tokio',
        bio: 'Fan de la cultura japonesa y rutas urbanas con fotos al atardecer.',
      },
      {
        id: 'gm-2',
        name: 'Laura Méndez',
        avatarUrl: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=300&q=80',
        age: 28,
        sex: 'mujer',
        destination: 'Osaka',
        bio: 'Me encanta descubrir cafeterias y templos con un plan flexible.',
      },
      {
        id: 'gm-3',
        name: 'Diego Arias',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
        age: 30,
        sex: 'hombre',
        destination: 'Kioto',
        bio: 'Busco grupo para combinar gastronomia local y visitas culturales.',
      },
    ],
    messages: [
      { id: 'm1', text: '¡Hola a todos! ¿Emocionados por el viaje?', sender: 'them', timestamp: '10:00' },
      { id: 'm2', text: '¡Sí! Ya tengo mis pasajes.', sender: 'me', timestamp: '10:05' },
      { id: 'm3', text: '¿Ya reservaron el hotel?', sender: 'them', timestamp: '10:30' }
    ]
  },
  {
    id: '2',
    name: 'Carlos Ruiz',
    avatarUrl: getAvatarByName('Carlos Ruiz'),
    lastMessage: 'Me encanta la idea de ir a Kioto.',
    lastMessageTime: 'Ayer',
    unread: 0,
    isGroup: false,
    age: 29,
    sex: 'hombre',
    destination: 'Kioto',
    bio: 'Me gusta viajar con planificación flexible, comida local y rutas culturales con buen ritmo.',
    messages: [
      { id: 'c1', text: 'Vi que también quieres ir a Kioto.', sender: 'them', timestamp: 'Yesterday' },
      { id: 'c2', text: '¡Sí! Es mi parte favorita del plan.', sender: 'me', timestamp: 'Yesterday' },
      { id: 'c3', text: 'Me encanta la idea de ir a Kioto.', sender: 'them', timestamp: 'Yesterday' }
    ]
  },
  {
    id: '3',
    name: 'Sarah Miller',
    avatarUrl: getAvatarByName('Sarah Miller'),
    lastMessage: '¡Hola! Vi que coincidimos en fechas.',
    lastMessageTime: 'Ayer',
    unread: 1,
    isGroup: false,
    age: 27,
    sex: 'mujer',
    destination: 'Kioto',
    bio: 'Busco compañia para descubrir barrios autenticos, tomar fotos y probar cafeterias locales.',
    messages: [
      { id: 's1', text: '¡Hola! Vi que coincidimos en fechas.', sender: 'them', timestamp: 'Yesterday' }
    ]
  },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, language, theme, initialTargetUser }) => {
  const isDark = theme === 'dark';
  const chatStorageKey = `tm_chats_${currentUser.id}`;
  const t = language === 'en'
    ? {
        messages: 'Messages',
        activeChats: 'active chats',
        online: 'Online',
        inputPlaceholder: 'Write a message...',
        sent: 'Message sent.',
        openingChat: 'Opening chat with',
        now: 'Now',
        viewProfile: 'View profile',
        profile: 'Profile',
        publicInfo: 'Public information',
        gender: 'Gender',
        destination: 'Destination',
        groupMembers: 'Group members',
        participants: 'participants',
        noDescription: 'This user has no description yet.',
      }
    : {
        messages: 'Mensajes',
        activeChats: 'chats activos',
        online: 'En línea',
        inputPlaceholder: 'Escribe un mensaje...',
        sent: 'Mensaje enviado.',
        openingChat: 'Abriendo chat con',
        now: 'Ahora',
        viewProfile: 'Ver perfil',
        profile: 'Perfil',
        publicInfo: 'Informacion publica',
        gender: 'Genero',
        destination: 'Destino',
        groupMembers: 'Integrantes del grupo',
        participants: 'participantes',
        noDescription: 'Este usuario aun no tiene descripcion.',
      };
  const [chats, setChats] = useState<ChatThreadType[]>(() => {
    const withLeaderDefaults = (items: ChatThreadType[]) =>
      items.map((chat) =>
        chat.isGroup && !chat.leaderId
          ? { ...chat, leaderId: 'current-user' }
          : chat
      );
    try {
      const savedChats = localStorage.getItem(chatStorageKey);
      if (!savedChats) return withLeaderDefaults(INITIAL_CHATS);
      const parsed = JSON.parse(savedChats) as ChatThreadType[];
      return Array.isArray(parsed) && parsed.length ? withLeaderDefaults(parsed) : withLeaderDefaults(INITIAL_CHATS);
    } catch {
      return withLeaderDefaults(INITIAL_CHATS);
    }
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [profilePreview, setProfilePreview] = useState<ChatThreadType | null>(null);
  const [groupMembersPreview, setGroupMembersPreview] = useState<ChatMember[] | null>(null);
  const [groupMembersTitle, setGroupMembersTitle] = useState('');
  const [groupMembersChatId, setGroupMembersChatId] = useState<string | null>(null);
  const [profileActionsOpen, setProfileActionsOpen] = useState(false);
  const { showToast } = useToast();
  const nameColors = ['text-sky-400', 'text-emerald-400', 'text-fuchsia-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400'];

  useEffect(() => {
    const withLeaderDefaults = (items: ChatThreadType[]) =>
      items.map((chat) =>
        chat.isGroup && !chat.leaderId
          ? { ...chat, leaderId: 'current-user' }
          : chat
      );
    try {
      const savedChats = localStorage.getItem(chatStorageKey);
      if (!savedChats) {
        setChats(withLeaderDefaults(INITIAL_CHATS));
        setActiveChatId(null);
        return;
      }
      const parsed = JSON.parse(savedChats) as ChatThreadType[];
      if (Array.isArray(parsed) && parsed.length) {
        setChats(withLeaderDefaults(parsed));
        setActiveChatId(null);
      } else {
        setChats(withLeaderDefaults(INITIAL_CHATS));
        setActiveChatId(null);
      }
    } catch {
      setChats(withLeaderDefaults(INITIAL_CHATS));
      setActiveChatId(null);
    }
  }, [chatStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(chats));
    } catch {
      // Ignore persistence errors and keep chat usable.
    }
  }, [chatStorageKey, chats]);

  useEffect(() => {
    if (!initialTargetUser) return;

    const directChatId = `direct-${initialTargetUser.id}`;
    setChats((prevChats) => {
      const existing = prevChats.find((chat) => chat.id === directChatId);
      if (existing) return prevChats;

      const newDirectChat: ChatThreadType = {
        id: directChatId,
        name: initialTargetUser.name,
        avatarUrl: initialTargetUser.avatarUrl,
        age: initialTargetUser.age,
        sex: initialTargetUser.sex,
        destination: initialTargetUser.destination,
        bio: initialTargetUser.bio,
        lastMessage: language === 'en' ? 'Say hi and start planning the trip.' : 'Saluda y empieza a planear el viaje.',
        lastMessageTime: t.now,
        unread: 0,
        isGroup: false,
        messages: [
          {
            id: `init-${initialTargetUser.id}`,
            text: language === 'en'
              ? `Hi ${initialTargetUser.name.split(' ')[0]}! We have great compatibility.`
              : `Hola ${initialTargetUser.name.split(' ')[0]}! Tenemos muy buena compatibilidad.`,
            sender: 'me',
            timestamp: t.now,
          },
        ],
      };

      return [newDirectChat, ...prevChats];
    });
    setActiveChatId(directChatId);
  }, [initialTargetUser, language, t.now]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const desktopActiveChat = activeChat || chats[0] || null;

  const getAuthorMeta = (chat: ChatThreadType, msg: ChatThreadType['messages'][number], msgIndex: number) => {
    if (msg.sender === 'me') {
      return {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      };
    }

    if (!chat.isGroup) {
      return {
        id: chat.id,
        name: chat.name,
        avatarUrl: chat.avatarUrl,
      };
    }

    const members = chat.members || [];
    const fallbackMember = members[msgIndex % Math.max(1, members.length)];
    return {
      id: msg.authorId || fallbackMember?.id || chat.id,
      name: msg.authorName || fallbackMember?.name || chat.name,
      avatarUrl: msg.authorAvatarUrl || fallbackMember?.avatarUrl || chat.avatarUrl,
    };
  };

  const getAuthorColorClass = (authorId: string) => {
    const sum = authorId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return nameColors[sum % nameColors.length];
  };
  const isGroupLeader = (chat?: ChatThreadType | null) =>
    !!chat?.isGroup && (chat.leaderId === currentUser.id || chat.leaderId === 'current-user');

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
              timestamp: t.now,
              authorId: currentUser.id,
              authorName: currentUser.name,
              authorAvatarUrl: currentUser.avatarUrl,
            }
          ]
        };
      }
      return chat;
    }));
    setNewMessage('');
    showToast(t.sent, 'info');
  };

  const openProfilePreview = (chat: ChatThreadType) => {
    if (chat.isGroup) return;
    setProfileActionsOpen(false);
    setProfilePreview(chat);
  };

  const openGroupMembers = (chat: ChatThreadType) => {
    if (!chat.isGroup) return;
    const members = chat.members || [];
    setGroupMembersTitle(chat.name);
    setGroupMembersPreview(members);
    setGroupMembersChatId(chat.id);
  };

  const openMemberProfile = (member: ChatMember) => {
    setProfileActionsOpen(false);
    setProfilePreview({
      id: member.id,
      name: member.name,
      avatarUrl: member.avatarUrl,
      age: member.age,
      sex: member.sex,
      bio: member.bio,
      destination: member.destination,
      lastMessage: '',
      lastMessageTime: '',
      unread: 0,
      isGroup: false,
      messages: [],
    });
  };

  const activeGroupChat = (activeChat?.isGroup ? activeChat : null) || (desktopActiveChat?.isGroup ? desktopActiveChat : null);
  const isActiveUserLeader = isGroupLeader(activeGroupChat);

  const handleDeleteGroup = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) setActiveChatId(null);
    if (groupMembersChatId === chatId) {
      setGroupMembersPreview(null);
      setGroupMembersChatId(null);
    }
    showToast(language === 'en' ? 'Group deleted.' : 'Grupo eliminado.', 'info');
  };

  const handleKickMember = (chatId: string, memberId: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          members: (chat.members || []).filter((member) => member.id !== memberId),
        };
      })
    );
    setGroupMembersPreview((prev) => (prev ? prev.filter((member) => member.id !== memberId) : prev));
    showToast(language === 'en' ? 'Member removed.' : 'Integrante expulsado.', 'info');
  };

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-4rem)] p-6">
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className={`p-5 border-b ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-white'}`}>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{t.messages}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.destination} · {chats.length} {t.activeChats}</p>
          </div>
          <div className="h-[calc(100%-92px)] overflow-y-auto">
            {chats.map((chat) => {
              const isSelected = (activeChatId || chats[0]?.id) === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? 'bg-travel-secondary/35' : (isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50')
                  }`}
                >
                  <button type="button" className="relative" onClick={(e) => { e.stopPropagation(); chat.isGroup ? openGroupMembers(chat) : openProfilePreview(chat); }}>
                    <SafeImage
                      src={chat.avatarUrl}
                      alt={chat.name}
                      fallbackSeed={chat.id + chat.name}
                      variant="avatar"
                      className={`w-14 h-14 object-cover ${chat.isGroup ? 'rounded-xl' : 'rounded-full'}`}
                    />
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-travel-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {chat.unread}
                      </span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{chat.name}</h3>
                      <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unread > 0 ? (isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {desktopActiveChat && (
          <div className={`rounded-3xl border shadow-sm overflow-hidden flex flex-col ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 shadow-sm flex items-center gap-3 border-b ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
              <SafeImage
                src={desktopActiveChat.avatarUrl}
                alt={desktopActiveChat.name}
                fallbackSeed={desktopActiveChat.id + desktopActiveChat.name}
                variant="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{desktopActiveChat.name}</h3>
                <span className="text-xs text-green-500 font-medium">{t.online}</span>
              </div>
              {!desktopActiveChat.isGroup && (
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => openProfilePreview(desktopActiveChat)}
                >
                  {t.viewProfile}
                </button>
              )}
              {desktopActiveChat.isGroup && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => openGroupMembers(desktopActiveChat)}
                  >
                    {t.groupMembers}
                  </button>
                  {isGroupLeader(desktopActiveChat) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(desktopActiveChat.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-400 text-red-400 hover:bg-red-500/10"
                    >
                      {language === 'en' ? 'Delete group' : 'Borrar grupo'}
                    </button>
                  )}
                </div>
              )}
              <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Phone size={20} /></button>
              <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Video size={20} /></button>
            </div>

            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-slate-950/40' : 'bg-gray-50/60'}`}>
              {desktopActiveChat.messages.map((msg, index) => {
                const author = getAuthorMeta(desktopActiveChat, msg, index);
                const authorColorClass = getAuthorColorClass(author.id);
                return (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] flex items-start gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                    <SafeImage
                      src={author.avatarUrl}
                      alt={author.name}
                      fallbackSeed={author.id + author.name}
                      variant="avatar"
                      className="w-7 h-7 rounded-full object-cover border border-white/20 mt-1"
                    />
                    <div className={`p-3 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-travel-primary text-white rounded-tr-none'
                      : (isDark ? 'bg-slate-800 text-gray-100 border border-slate-700 rounded-tl-none shadow-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm')
                  }`}>
                    <p className={`text-[11px] font-bold mb-1 ${authorColorClass}`}>{author.name}</p>
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
              );})}
            </div>

            <div className={`p-3 border-t flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
              <button
                type="button"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? 'bg-slate-800 text-gray-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Audio"
              >
                <Mic size={18} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.inputPlaceholder}
                className={`flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-travel-primary/50 text-sm ${isDark ? 'bg-slate-800 text-gray-100 placeholder-gray-400' : 'bg-gray-100'}`}
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
        <div className={`lg:hidden flex flex-col h-full max-w-2xl mx-auto h-screen pb-20 ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
          <div className={`p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 ${isDark ? 'bg-slate-900 border-b border-slate-700' : 'bg-white'}`}>
            <button onClick={() => setActiveChatId(null)} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <SafeImage
              src={activeChat.avatarUrl}
              alt={activeChat.name}
              fallbackSeed={activeChat.id + activeChat.name}
              variant="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{activeChat.name}</h3>
              <span className="text-xs text-green-500 font-medium">{t.online}</span>
            </div>
            {!activeChat.isGroup && (
              <button
                type="button"
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => openProfilePreview(activeChat)}
              >
                {t.viewProfile}
              </button>
            )}
            {activeChat.isGroup && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => openGroupMembers(activeChat)}
                >
                  {t.groupMembers}
                </button>
                {isGroupLeader(activeChat) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(activeChat.id)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-red-400 text-red-400 hover:bg-red-500/10"
                  >
                    {language === 'en' ? 'Delete group' : 'Borrar grupo'}
                  </button>
                )}
              </div>
            )}
            <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Phone size={20} /></button>
            <button className="p-2 text-travel-accent hover:bg-gray-50 rounded-full"><Video size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChat.messages.map((msg, index) => {
              const author = getAuthorMeta(activeChat, msg, index);
              const authorColorClass = getAuthorColorClass(author.id);
              return (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex items-start gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                  <SafeImage
                    src={author.avatarUrl}
                    alt={author.name}
                    fallbackSeed={author.id + author.name}
                    variant="avatar"
                    className="w-7 h-7 rounded-full object-cover border border-white/20 mt-1"
                  />
                  <div className={`p-3 rounded-2xl ${
                  msg.sender === 'me'
                    ? 'bg-travel-primary text-white rounded-tr-none'
                    : (isDark ? 'bg-slate-800 text-gray-100 border border-slate-700 rounded-tl-none shadow-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm')
                }`}>
                  <p className={`text-[11px] font-bold mb-1 ${authorColorClass}`}>{author.name}</p>
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[10px] block text-right mt-1 ${msg.sender === 'me' ? 'text-white/80' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
            );})}
          </div>

          <div className={`p-3 border-t flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
            <button
              type="button"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isDark ? 'bg-slate-800 text-gray-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Audio"
            >
              <Mic size={18} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.inputPlaceholder}
              className={`flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-travel-primary/50 text-sm ${isDark ? 'bg-slate-800 text-gray-100 placeholder-gray-400' : 'bg-gray-100'}`}
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
        <div className={`lg:hidden flex flex-col h-full max-w-2xl mx-auto shadow-sm min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <div className={`p-4 border-b sticky top-0 z-10 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-white'}`}>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{t.messages}</h1>
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
                className={`flex items-center gap-4 p-4 transition-colors border-b cursor-pointer ${isDark ? 'hover:bg-slate-800 border-slate-800' : 'hover:bg-gray-50 border-gray-50'}`}
              >
                <div className="relative">
                  <button type="button" onClick={(e) => { e.stopPropagation(); chat.isGroup ? openGroupMembers(chat) : openProfilePreview(chat); }}>
                    <SafeImage
                      src={chat.avatarUrl}
                      alt={chat.name}
                      fallbackSeed={chat.id + chat.name}
                      variant="avatar"
                      className={`w-14 h-14 object-cover ${chat.isGroup ? 'rounded-xl' : 'rounded-full'}`}
                    />
                  </button>
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-travel-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {chat.unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-bold truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{chat.name}</h3>
                    <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread > 0 ? (isDark ? 'text-gray-100 font-medium' : 'text-gray-900 font-medium') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profilePreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <h3 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.profile}</h3>
              <div className="relative flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setProfileActionsOpen((prev) => !prev)}
                  className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <MoreVertical size={18} />
                </button>
                {profileActionsOpen && (
                  <div className={`absolute right-12 top-0 min-w-[190px] rounded-xl border p-2 shadow-xl ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                      {language === 'en' ? 'Remove from friends' : 'Eliminar de amigos'}
                    </button>
                    <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                      {language === 'en' ? 'Report' : 'Reportar'}
                    </button>
                    <button type="button" className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10">
                      {language === 'en' ? 'Block user' : 'Bloquear a gente'}
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => setProfilePreview(null)} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <SafeImage
                  src={profilePreview.avatarUrl}
                  alt={profilePreview.name}
                  fallbackSeed={(profilePreview.id || '') + profilePreview.name}
                  variant="avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-travel-secondary/60"
                />
                <div>
                  <h4 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {profilePreview.name}{profilePreview.age ? `, ${profilePreview.age}` : ''}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{t.publicInfo}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm leading-relaxed`}>
                  {profilePreview.bio || t.noDescription}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.gender}:</span>
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-600'}`}>{profilePreview.sex || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-travel-accent" />
                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t.destination}:</span>
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-600'}`}>{profilePreview.destination || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {groupMembersPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <div>
                <h3 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.groupMembers}</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{groupMembersTitle} · {groupMembersPreview.length} {t.participants}</p>
              </div>
              <button type="button" onClick={() => setGroupMembersPreview(null)} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-gray-200' : 'hover:bg-gray-100 text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {groupMembersPreview.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => openMemberProfile(member)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    isDark
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <SafeImage
                    src={member.avatarUrl}
                    alt={member.name}
                    fallbackSeed={member.id + member.name}
                    variant="avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{member.name}, {member.age}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{member.destination}</p>
                  </div>
                  {isActiveUserLeader && groupMembersChatId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKickMember(groupMembersChatId, member.id);
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-red-400 text-red-400 hover:bg-red-500/10"
                    >
                      {language === 'en' ? 'Kick' : 'Echar'}
                    </button>
                  )}
                  <Users size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};