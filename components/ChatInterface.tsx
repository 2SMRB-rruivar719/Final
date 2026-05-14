import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, ChatThreadType, ChatMember, LanguageCode, ThemeMode } from '../types';
import { ChevronLeft, Send, Phone, Video, MapPin, X, Users, Mic, MoreVertical, Plus, UsersRound, Check } from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { useToast } from './ToastProvider';
import { getAvatarByName } from '../services/avatarByName';
import {
  addBlockedUser,
  getDirectChatPeerId,
  isUserBlocked,
  purgeDirectChatsWithPeer,
  readBlockedUsers,
  CHATS_STORAGE_MUTATED_EVENT,
} from '../services/blockedUsers';

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

const filterChatsByBlocklist = (items: ChatThreadType[], blocked: Set<string>) =>
  items.filter((chat) => {
    if (chat.isGroup) return true;
    const pid = getDirectChatPeerId(chat);
    return !pid || !blocked.has(pid);
  });

const directChatToMember = (chat: ChatThreadType): ChatMember | null => {
  if (chat.isGroup) return null;
  const id = getDirectChatPeerId(chat);
  if (!id) return null;
  return {
    id,
    name: chat.name,
    avatarUrl: chat.avatarUrl,
    age: chat.age ?? 25,
    sex: chat.sex ?? 'hombre',
    bio: chat.bio ?? '',
    destination: chat.destination ?? '',
  };
};

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
        blockUser: 'Block user',
        blockConfirm: 'Block this user? Their chat will be deleted and they will not appear in your inbox.',
        blockedOk: 'User blocked.',
        newGroup: 'New group',
        newGroupSubtitle: 'Name your trip crew and invite travelers you already chat with.',
        groupNameLabel: 'Group name',
        groupNamePlaceholder: 'e.g. Weekend in Lisbon',
        pickTravelers: 'Add travelers',
        pickTravelersHint: 'Pick from your direct chats (at least one).',
        noDirectChats: 'No direct chats yet. Say hi to someone in Explore first.',
        createGroup: 'Create group',
        cancel: 'Cancel',
        needMembers: 'Add at least one traveler to the group.',
        groupCreated: 'Group created.',
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
        blockUser: 'Bloquear usuario',
        blockConfirm: '¿Bloquear a esta persona? Se eliminará el chat y no aparecerá en tu bandeja.',
        blockedOk: 'Usuario bloqueado.',
        newGroup: 'Nuevo grupo',
        newGroupSubtitle: 'Pon nombre a la tripulación e invita a viajeros con los que ya chateas.',
        groupNameLabel: 'Nombre del grupo',
        groupNamePlaceholder: 'Ej. Fin de semana en Lisboa',
        pickTravelers: 'Añadir viajeros',
        pickTravelersHint: 'Elige de tus chats directos (al menos uno).',
        noDirectChats: 'Aún no tienes chats directos. Saluda a alguien en Explorar primero.',
        createGroup: 'Crear grupo',
        cancel: 'Cancelar',
        needMembers: 'Añade al menos un viajero al grupo.',
        groupCreated: 'Grupo creado.',
      };
  const [chats, setChats] = useState<ChatThreadType[]>(() => {
    const withLeaderDefaults = (items: ChatThreadType[]) =>
      items.map((chat) =>
        chat.isGroup && !chat.leaderId
          ? { ...chat, leaderId: 'current-user' }
          : chat
      );
    const blocked = new Set(readBlockedUsers(currentUser.id).map((e) => e.userId));
    try {
      const savedChats = localStorage.getItem(chatStorageKey);
      if (!savedChats) return filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked);
      const parsed = JSON.parse(savedChats) as ChatThreadType[];
      const base = Array.isArray(parsed) && parsed.length ? withLeaderDefaults(parsed) : withLeaderDefaults(INITIAL_CHATS);
      return filterChatsByBlocklist(base, blocked);
    } catch {
      return filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked);
    }
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [profilePreview, setProfilePreview] = useState<ChatThreadType | null>(null);
  const [groupMembersPreview, setGroupMembersPreview] = useState<ChatMember[] | null>(null);
  const [groupMembersTitle, setGroupMembersTitle] = useState('');
  const [groupMembersChatId, setGroupMembersChatId] = useState<string | null>(null);
  const [profileActionsOpen, setProfileActionsOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const { showToast } = useToast();
  const nameColors = ['text-sky-400', 'text-emerald-400', 'text-fuchsia-400', 'text-amber-400', 'text-rose-400', 'text-cyan-400'];

  useEffect(() => {
    const withLeaderDefaults = (items: ChatThreadType[]) =>
      items.map((chat) =>
        chat.isGroup && !chat.leaderId
          ? { ...chat, leaderId: 'current-user' }
          : chat
      );
    const blocked = new Set(readBlockedUsers(currentUser.id).map((e) => e.userId));
    try {
      const savedChats = localStorage.getItem(chatStorageKey);
      if (!savedChats) {
        setChats(filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked));
        setActiveChatId(null);
        return;
      }
      const parsed = JSON.parse(savedChats) as ChatThreadType[];
      if (Array.isArray(parsed) && parsed.length) {
        setChats(filterChatsByBlocklist(withLeaderDefaults(parsed), blocked));
        setActiveChatId(null);
      } else {
        setChats(filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked));
        setActiveChatId(null);
      }
    } catch {
      setChats(filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked));
      setActiveChatId(null);
    }
  }, [chatStorageKey]);

  useEffect(() => {
    const syncFromStorage = () => {
      const withLeaderDefaults = (items: ChatThreadType[]) =>
        items.map((chat) =>
          chat.isGroup && !chat.leaderId
            ? { ...chat, leaderId: 'current-user' }
            : chat
        );
      const blocked = new Set(readBlockedUsers(currentUser.id).map((e) => e.userId));
      try {
        const savedChats = localStorage.getItem(chatStorageKey);
        if (!savedChats) {
          setChats(filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked));
          return;
        }
        const parsed = JSON.parse(savedChats) as ChatThreadType[];
        const base = Array.isArray(parsed) && parsed.length ? withLeaderDefaults(parsed) : withLeaderDefaults(INITIAL_CHATS);
        setChats(filterChatsByBlocklist(base, blocked));
      } catch {
        setChats(filterChatsByBlocklist(withLeaderDefaults(INITIAL_CHATS), blocked));
      }
    };
    window.addEventListener(CHATS_STORAGE_MUTATED_EVENT, syncFromStorage);
    return () => window.removeEventListener(CHATS_STORAGE_MUTATED_EVENT, syncFromStorage);
  }, [chatStorageKey, currentUser.id]);

  useEffect(() => {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(chats));
    } catch {
      // Ignore persistence errors and keep chat usable.
    }
  }, [chatStorageKey, chats]);

  useEffect(() => {
    if (!initialTargetUser) return;
    if (isUserBlocked(currentUser.id, initialTargetUser.id)) {
      showToast(
        language === 'en'
          ? 'You blocked this traveler. Unblock them in Settings to chat again.'
          : 'Has bloqueado a esta persona. Desbloquéala en Configuración para volver a chatear.',
        'error'
      );
      return;
    }

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
  }, [initialTargetUser, language, currentUser.id, showToast]);

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

  const handleBlockUserByPeerId = (peerId: string, name: string, avatarUrl?: string) => {
    if (!peerId || peerId === currentUser.id) return;
    if (!window.confirm(t.blockConfirm)) return;
    addBlockedUser(currentUser.id, { userId: peerId, name, avatarUrl });
    purgeDirectChatsWithPeer(currentUser.id, peerId);
    setChats((prev) => prev.filter((c) => getDirectChatPeerId(c) !== peerId || c.isGroup));
    setActiveChatId((aid) => {
      if (!aid) return null;
      if (aid === `direct-${peerId}` || aid === peerId) return null;
      return aid;
    });
    setProfilePreview(null);
    setProfileActionsOpen(false);
    setGroupMembersPreview(null);
    setGroupMembersChatId(null);
    showToast(t.blockedOk, 'info');
  };

  const directChatsForPicker = useMemo(() => {
    return chats
      .filter((c) => !c.isGroup)
      .map((c) => ({ chat: c, member: directChatToMember(c) }))
      .filter((x): x is { chat: ChatThreadType; member: ChatMember } => x.member !== null);
  }, [chats]);

  const openCreateGroupModal = () => {
    setNewGroupName('');
    setSelectedMemberIds([]);
    setCreateGroupOpen(true);
  };

  const toggleMemberForGroup = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleCreateGroup = () => {
    if (selectedMemberIds.length === 0) {
      showToast(t.needMembers, 'error');
      return;
    }
    const members: ChatMember[] = [];
    for (const id of selectedMemberIds) {
      const row = directChatsForPicker.find((x) => x.member.id === id);
      if (row) members.push(row.member);
    }
    if (members.length === 0) {
      showToast(t.needMembers, 'error');
      return;
    }
    const trimmed = newGroupName.trim();
    const groupName =
      trimmed ||
      (language === 'en' ? `Group · ${currentUser.destination}` : `Grupo · ${currentUser.destination}`);
    const gid = `group-${Date.now()}`;
    const nMembers = members.length;
    const welcome =
      language === 'en'
        ? `You created "${groupName}". ${nMembers} traveler${nMembers === 1 ? ' is' : 's are'} in — break the ice!`
        : `Has creado "${groupName}". ${nMembers} viajero${nMembers === 1 ? '' : 's'} dentro — ¡romped el hielo!`;
    const newGroup: ChatThreadType = {
      id: gid,
      name: groupName,
      avatarUrl: `https://picsum.photos/seed/g${Date.now()}/300/300`,
      lastMessage: language === 'en' ? 'New group — say hi!' : 'Nuevo grupo — ¡saludad!',
      lastMessageTime: t.now,
      unread: 0,
      isGroup: true,
      leaderId: currentUser.id,
      members,
      messages: [
        {
          id: `g-init-${gid}`,
          text: welcome,
          sender: 'me',
          timestamp: t.now,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatarUrl: currentUser.avatarUrl,
        },
      ],
    };
    setChats((prev) => [newGroup, ...prev]);
    setActiveChatId(gid);
    setCreateGroupOpen(false);
    setNewGroupName('');
    setSelectedMemberIds([]);
    showToast(t.groupCreated, 'success');
  };

  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-[360px_1fr] gap-6 h-[calc(100vh-4rem)] p-6">
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
          <div className={`p-5 border-b flex items-start justify-between gap-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-white'}`}>
            <div className="min-w-0 flex-1">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{t.messages}</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.destination} · {chats.length} {t.activeChats}</p>
            </div>
            <button
              type="button"
              onClick={openCreateGroupModal}
              title={t.newGroup}
              className={`group flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark
                  ? 'bg-gradient-to-br from-travel-primary to-travel-accent text-white ring-1 ring-white/15 hover:brightness-110 focus-visible:ring-offset-slate-900'
                  : 'bg-gradient-to-br from-travel-primary to-travel-accent text-white ring-1 ring-travel-primary/30 hover:shadow-lg hover:scale-[1.03] focus-visible:ring-offset-white'
              }`}
            >
              <Plus size={24} strokeWidth={2.4} className="transition-transform group-hover:rotate-90" />
            </button>
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
          <div className={`p-4 border-b sticky top-0 z-10 flex items-center justify-between gap-3 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-white'}`}>
            <h1 className={`text-2xl font-bold min-w-0 ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{t.messages}</h1>
            <button
              type="button"
              onClick={openCreateGroupModal}
              title={t.newGroup}
              className={`group flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark
                  ? 'bg-gradient-to-br from-travel-primary to-travel-accent text-white ring-1 ring-white/15 hover:brightness-110 focus-visible:ring-offset-slate-900'
                  : 'bg-gradient-to-br from-travel-primary to-travel-accent text-white ring-1 ring-travel-primary/30 hover:shadow-lg hover:scale-[1.03] focus-visible:ring-offset-white'
              }`}
            >
              <Plus size={22} strokeWidth={2.4} className="transition-transform group-hover:rotate-90" />
            </button>
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

      {createGroupOpen && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div
            className={`flex max-h-[min(92vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border shadow-2xl sm:rounded-[2rem] ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-travel-primary via-travel-primary to-travel-accent px-5 pb-10 pt-8 text-white">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-8 left-8 h-28 w-28 rounded-full bg-black/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/35 shadow-inner">
                    <UsersRound size={26} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold tracking-tight">{t.newGroup}</h2>
                    <p className="mt-1 max-w-[300px] text-sm leading-snug text-white/90">{t.newGroupSubtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateGroupOpen(false)}
                  className="shrink-0 rounded-xl p-2 text-white/90 transition-colors hover:bg-white/15"
                  aria-label={t.cancel}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
              <div>
                <label
                  htmlFor="tm-new-group-name"
                  className={`mb-1.5 block text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {t.groupNameLabel}
                </label>
                <input
                  id="tm-new-group-name"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={t.groupNamePlaceholder}
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-travel-primary/45 ${
                    isDark
                      ? 'border-slate-600 bg-slate-800 text-gray-100 placeholder-gray-500'
                      : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              <div>
                <h3 className={`mb-1 text-xs font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.pickTravelers}
                </h3>
                <p className={`mb-3 text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t.pickTravelersHint}</p>
                {directChatsForPicker.length === 0 ? (
                  <p
                    className={`rounded-2xl border px-4 py-8 text-center text-sm leading-relaxed ${
                      isDark ? 'border-slate-700 bg-slate-800/60 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-600'
                    }`}
                  >
                    {t.noDirectChats}
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {directChatsForPicker.map(({ member }) => {
                      const selected = selectedMemberIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleMemberForGroup(member.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            selected
                              ? isDark
                                ? 'border-travel-accent bg-travel-primary/15 ring-2 ring-travel-accent/45'
                                : 'border-travel-primary bg-travel-secondary/50 ring-2 ring-travel-primary/25 shadow-sm'
                              : isDark
                                ? 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <SafeImage
                              src={member.avatarUrl}
                              alt={member.name}
                              fallbackSeed={member.id + member.name}
                              variant="avatar"
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-white/40"
                            />
                            {selected && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-travel-accent text-white shadow-md ring-2 ring-white">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{member.name}</p>
                            <p className={`truncate text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{member.destination}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex gap-3 border-t px-4 py-4 sm:px-6 ${isDark ? 'border-slate-700 bg-slate-900/95' : 'border-gray-100 bg-gray-50/95'}`}
            >
              <Button type="button" variant="outline" fullWidth className="py-3" onClick={() => setCreateGroupOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                type="button"
                fullWidth
                className="py-3 shadow-md shadow-travel-primary/20"
                onClick={handleCreateGroup}
                disabled={selectedMemberIds.length === 0}
              >
                {t.createGroup}
              </Button>
            </div>
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
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        isDark ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      disabled
                    >
                      {language === 'en' ? 'Remove from friends' : 'Eliminar de amigos'}
                    </button>
                    <button
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        isDark ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                      disabled
                    >
                      {language === 'en' ? 'Report' : 'Reportar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!profilePreview) return;
                        const peerId = getDirectChatPeerId(profilePreview);
                        if (!peerId) return;
                        handleBlockUserByPeerId(peerId, profilePreview.name, profilePreview.avatarUrl);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                    >
                      {t.blockUser}
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
                  {member.id !== currentUser.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockUserByPeerId(member.id, member.name, member.avatarUrl);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t.blockUser}
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