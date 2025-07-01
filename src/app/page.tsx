
"use client";

import * as React from "react";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import type { Chat, User, Message } from "@/lib/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FilePreviewDialog } from "@/components/file-preview-dialog";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { AuthGuard } from "@/components/auth-guard";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { user: currentUser, firebaseUser, updateUser } = useAuth();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = React.useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = React.useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = React.useState<Message['file'] | null>(null);

  // Listen for user updates
  React.useEffect(() => {
    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const usersList = querySnapshot.docs.map((doc) => doc.data() as User);
      setAllUsers(usersList);
    });
    return () => unsubscribe();
  }, []);

  // Listen for chat updates
  React.useEffect(() => {
    if (!currentUser?.id || allUsers.length === 0) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("userIds", "array-contains", currentUser.id)
    );

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const chatUsers = data.userIds
          ? data.userIds.map((id: string) => allUsers.find(u => u.id === id)).filter(Boolean)
          : [];

        return {
          id: doc.id,
          ...data,
          users: chatUsers,
        } as Chat;
      });
      setChats(chatsData);
    });

    return () => unsubscribe();
  }, [currentUser?.id, allUsers]);

  // Listen for message updates in the selected chat
  React.useEffect(() => {
    if (!selectedChat?.id || allUsers.length === 0) {
        setMessages([]);
        return;
    }

    const messagesQuery = query(
      collection(db, `chats/${selectedChat.id}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const user = allUsers.find(u => u.id === data.userId);
        return {
          id: doc.id,
          ...data,
          user: user || { id: 'unknown', name: 'Unknown User', avatar: '' }, // Fallback for unknown user
          timestamp: (data.timestamp as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Message;
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedChat?.id, allUsers]);

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
            toast({ variant: 'destructive', title: 'File Error', description: 'Could not read file.'});
            return;
        }
    }

    if (!content && !fileData) return;

    const messagePayload: any = {
      userId: currentUser.id,
      content,
      timestamp: serverTimestamp(),
    };

    if (fileData) {
        messagePayload.file = fileData;
    }

    await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messagePayload);
    
    setMessageContent("");
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    if (!currentUser) return;
    
    const allMemberIds = Array.from(new Set([currentUser.id, ...memberIds]));

    try {
        await addDoc(collection(db, "chats"), {
            name,
            type: "group",
            userIds: allMemberIds,
            createdAt: serverTimestamp(),
            createdBy: currentUser.id,
            avatar: `https://placehold.co/100x100/A9A9A9/FFF?text=${name.substring(0,2).toUpperCase()}`,
            description: "A new group chat.",
        });
        setIsCreateGroupOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: `Could not create group: ${error.message}` });
    }
  };

  const handleCreateDmChat = async (otherUserId: string) => {
    if (!currentUser) return;

    const existingChat = chats.find(chat =>
      chat.type === 'dm' &&
      chat.userIds.length === 2 &&
      chat.userIds.includes(currentUser.id) &&
      chat.userIds.includes(otherUserId)
    );

    if (existingChat) {
      handleSelectChat(existingChat);
      return;
    }

    try {
      const otherUser = allUsers.find(u => u.id === otherUserId);
      if (!otherUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find user.' });
        return;
      }

      await addDoc(collection(db, 'chats'), {
        name: `${currentUser.name} & ${otherUser.name}`,
        type: 'dm',
        userIds: [currentUser.id, otherUserId],
        createdAt: serverTimestamp(),
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Could not start chat: ${error.message}`,
      });
    }
  };

  const handleUpdateGroupMembers = async (chatId: string, memberIds: string[]) => {
    const chatDocRef = doc(db, "chats", chatId);
    try {
        await updateDoc(chatDocRef, { userIds: memberIds });
        setIsManageGroupOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: `Could not update members: ${error.message}` });
    }
  };
  
  const handleUpdateGroupDetails = async (chatId: string, details: { name: string; description?: string; avatar?: string }) => {
    const chatDocRef = doc(db, "chats", chatId);
    try {
        await updateDoc(chatDocRef, details);
        setIsGroupSettingsOpen(false);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: `Could not update group: ${error.message}` });
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    if (!firebaseUser) return;
    try {
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: updatedUser.name,
        photoURL: updatedUser.avatar,
      });

      // Update Firestore user document
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
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

  const handleDeleteMessage = async (chatId: string, messageId: string) => {
    try {
      await deleteDoc(doc(db, `chats/${chatId}/messages`, messageId));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: 'Error',
        description: `Could not delete message: ${error.message}`,
      });
    }
  };

  const handleUpdateMessage = async (chatId: string, messageId: string, content: string) => {
    try {
      await updateDoc(doc(db, `chats/${chatId}/messages`, messageId), {
        content: content,
        editedAt: serverTimestamp(),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: 'Error',
        description: `Could not update message: ${error.message}`,
      });
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
            allUsers={allUsers}
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
            allUsers={allUsers}
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
            handleStartChat={handleCreateDmChat}
          />
          <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
