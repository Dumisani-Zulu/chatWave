
"use client";

import * as React from "react";
import { mockUsers, mockChats, Chat, User, Message } from "@/lib/data";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FilePreviewDialog } from "@/components/file-preview-dialog";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = React.useState<User>(mockUsers[0]);
  const [chats, setChats] = React.useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(chats[0]);
  const [messages, setMessages] = React.useState<Message[]>(
    selectedChat?.messages || []
  );
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = React.useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = React.useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = React.useState<Message['file'] | null>(null);


  React.useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;

    const content = messageContent.trim();
    if (!content && !selectedFile) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      user: currentUser,
      content,
      timestamp: new Date().toISOString(),
      file: selectedFile ? {
          name: selectedFile.name,
          url: URL.createObjectURL(selectedFile),
          size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
          type: selectedFile.type,
      } : undefined,
    };

    const newChats = chats.map((chat) =>
      chat.id === selectedChat.id
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    );

    setChats(newChats);
    const updatedChat = newChats.find((chat) => chat.id === selectedChat.id);
    if (updatedChat) {
      setSelectedChat(updatedChat);
    }
    
    setMessageContent("");
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCreateGroup = (name: string, memberIds: string[]) => {
    const newGroup: Chat = {
      id: `c${Date.now()}`,
      name,
      type: "group",
      users: mockUsers.filter((u) => memberIds.includes(u.id)),
      messages: [],
      avatar: `https://placehold.co/100x100/A9A9A9/FFF?text=${name.substring(0,2).toUpperCase()}`,
      description: "A new group chat.",
    };
    const newChats = [newGroup, ...chats];
    setChats(newChats);
    setSelectedChat(newGroup);
    setIsCreateGroupOpen(false);
  };

  const handleUpdateGroupMembers = (chatId: string, memberIds: string[]) => {
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          users: mockUsers.filter((u) => memberIds.includes(u.id)),
        };
      }
      return chat;
    });
    setChats(updatedChats);
    const updatedSelectedChat = updatedChats.find((chat) => chat.id === selectedChat?.id);
    if (updatedSelectedChat) {
      setSelectedChat(updatedSelectedChat);
    }
    setIsManageGroupOpen(false);
  };
  
  const handleUpdateGroupDetails = (chatId: string, details: { name: string; description?: string; avatar?: string }) => {
    const updatedChats = chats.map((chat) => 
      chat.id === chatId ? { ...chat, ...details } : chat
    );
    setChats(updatedChats);
    if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, ...details } : null);
    }
    setIsGroupSettingsOpen(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    
    const userIndex = mockUsers.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser;
    }

    const updatedChats = chats.map(chat => ({
        ...chat,
        users: chat.users.map(user => user.id === updatedUser.id ? updatedUser : user),
        messages: chat.messages.map(message => ({
            ...message,
            user: message.user.id === updatedUser.id ? updatedUser : message.user,
        })),
    }));
    setChats(updatedChats);
  };


  const conversationHistory = messages.map(m => `${m.user.name}: ${m.content}`).join('\n');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar
          currentUser={currentUser}
          chats={chats}
          selectedChat={selectedChat}
          handleSelectChat={handleSelectChat}
          isCreateGroupOpen={isCreateGroupOpen}
          setIsCreateGroupOpen={setIsCreateGroupOpen}
          handleCreateGroup={handleCreateGroup}
          isUserSettingsOpen={isUserSettingsOpen}
          setIsUserSettingsOpen={setIsUserSettingsOpen}
          handleUpdateUser={handleUpdateUser}
        />
        <ChatArea
          selectedChat={selectedChat}
          currentUser={currentUser}
          messages={messages}
          isManageGroupOpen={isManageGroupOpen}
          setIsManageGroupOpen={setIsManageGroupOpen}
          handleUpdateGroupMembers={handleUpdateGroupMembers}
          isGroupSettingsOpen={isGroupSettingsOpen}
          setIsGroupSettingsOpen={setIsGroupSettingsOpen}
          handleUpdateGroupDetails={handleUpdateGroupDetails}
          setPreviewFile={setPreviewFile}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleSendMessage={handleSendMessage}
          fileInputRef={fileInputRef}
          conversationHistory={conversationHistory}
        />
        <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
      </div>
    </SidebarProvider>
  );
}
