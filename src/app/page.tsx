
"use client";

import * as React from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { mockUsers, mockChats, Chat, User, Message } from "@/lib/data";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FilePreviewDialog } from "@/components/file-preview-dialog";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { AuthGuard } from "@/components/auth-guard";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { user: currentUser, firebaseUser, updateUser } = useAuth();
  const { toast } = useToast();

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

  const handleSendMessage = async () => {
    if (!selectedChat || !currentUser) return;

    const content = messageContent.trim();
    let fileData: Message['file'] | undefined = undefined;

    if (selectedFile) {
      try {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              name: selectedFile.name,
              url: event.target?.result as string,
              size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
              type: selectedFile.type,
            });
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(selectedFile);
        });
      } catch (error) {
        console.error("Error reading file:", error);
        return;
      }
    }

    if (!content && !fileData) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      user: currentUser,
      content,
      timestamp: new Date().toISOString(),
      file: fileData,
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
    if (!currentUser) return;

    const groupMembers = mockUsers.filter(u => memberIds.includes(u.id));
    if (!groupMembers.find(u => u.id === currentUser.id)) {
        groupMembers.push(currentUser);
    }

    const newGroup: Chat = {
      id: `c${Date.now()}`,
      name,
      type: "group",
      users: groupMembers,
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

  const handleUpdateUser = async (updatedUser: User) => {
    if (!firebaseUser) return;
    try {
      await updateProfile(firebaseUser, {
        displayName: updatedUser.name,
        photoURL: updatedUser.avatar,
      });

      updateUser(updatedUser);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated.',
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: 'Update Failed',
        description: error.message,
      });
    }
  };

  const handleDeleteMessage = (chatId: string, messageId: string) => {
    const newChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter((m) => m.id !== messageId),
        };
      }
      return chat;
    });

    setChats(newChats);
    if (selectedChat?.id === chatId) {
        const updatedChat = newChats.find((chat) => chat.id === chatId);
        if (updatedChat) {
            setSelectedChat(updatedChat);
        }
    }
  };

  const handleUpdateMessage = (chatId: string, messageId: string, content: string) => {
    const newChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map((m) =>
            m.id === messageId ? { ...m, content, file: m.file } : m
          ),
        };
      }
      return chat;
    });

    setChats(newChats);
    if (selectedChat?.id === chatId) {
        const updatedChat = newChats.find((chat) => chat.id === chatId);
        if (updatedChat) {
            setSelectedChat(updatedChat);
        }
    }
  };

  const conversationHistory = messages.map(m => `${m.user.name}: ${m.content}`).join('\n');

  if (!currentUser) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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
            handleDeleteMessage={handleDeleteMessage}
            handleUpdateMessage={handleUpdateMessage}
            fileInputRef={fileInputRef}
            conversationHistory={conversationHistory}
          />
          <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
