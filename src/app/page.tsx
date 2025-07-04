
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
  getDocs,
} from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import type { Chat, User, Message } from "@/lib/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FilePreviewDialog } from "@/components/file-preview-dialog";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { AuthGuard } from "@/components/auth-guard";
import { useToast } from "@/hooks/use-toast";
import { UserProfileDialog } from "@/components/user-profile-dialog";

type RawChat = Omit<Chat, 'users'>;

export default function ChatPage() {
  const { user: currentUser, firebaseUser, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [rawChats, setRawChats] = React.useState<RawChat[]>([]);
  const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = React.useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = React.useState<Message['file'] | null>(null);
  const [viewedUser, setViewedUser] = React.useState<User | null>(null);

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
    if (!currentUser?.id) return;

    const chatsQuery = query(
      collection(db, "chats"),
      where("userIds", "array-contains", currentUser.id)
    );

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const chatsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
          lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate().toISOString(),
        } as RawChat
      });
      setRawChats(chatsData);
    });

    return () => unsubscribe();
  }, [currentUser?.id]);

  const chats: Chat[] = React.useMemo(() => {
    return rawChats.map(chat => {
      const users = chat.userIds
        .map((id: string) => allUsers.find(u => u.id === id))
        .filter(Boolean) as User[];
      return { ...chat, users };
    });
  }, [rawChats, allUsers]);

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

    await updateDoc(doc(db, "chats", selectedChat.id), {
        lastMessageAt: serverTimestamp(),
    });
    
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
        const newChatRef = await addDoc(collection(db, "chats"), {
            name,
            type: "group",
            userIds: allMemberIds,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
            createdBy: currentUser.id,
            avatar: `https://placehold.co/100x100/A9A9A9/FFF?text=${name.substring(0,2).toUpperCase()}`,
            description: "A new group chat.",
        });
        setIsCreateGroupOpen(false);
        // Select the newly created group chat
        const newChat = chats.find(chat => chat.id === newChatRef.id);
        if (newChat) {
          handleSelectChat(newChat);
        }
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

      const newChatRef = await addDoc(collection(db, 'chats'), {
        name: `${currentUser.name} & ${otherUser.name}`,
        type: 'dm',
        userIds: [currentUser.id, otherUserId],
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
      // This is a bit of a workaround to immediately select the new chat.
      // A better solution would involve listening to the new chat document.
      const newChatSnapshot = await getDocs(query(collection(db, "chats"), where("__name__", "==", newChatRef.id)));
      if (!newChatSnapshot.empty) {
        const doc = newChatSnapshot.docs[0];
        const data = doc.data();
        const createdChat = {
          id: doc.id,
          ...data,
          users: [currentUser, otherUser],
        } as Chat
        handleSelectChat(createdChat);
      }
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

  const handleDeleteGroup = async (chatId: string) => {
    if (!selectedChat || selectedChat.id !== chatId) return;
    try {
      await deleteDoc(doc(db, "chats", chatId));
      setSelectedChat(null);
      toast({
        title: "Group Deleted",
        description: "The group has been permanently deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not delete group: ${error.message}`,
      });
    }
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (!firebaseUser) return;
    try {
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: data.name,
        photoURL: data.avatar,
      });

      // Update Firestore user document via the hook
      await updateUserProfile(data);
      
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

  const handleViewProfile = (user: User) => {
    setViewedUser(user);
  };

  const getSharedFiles = async (chatId: string): Promise<Message['file'][]> => {
    const filesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      where('file', '!=', null),
      orderBy('file')
    );
    const querySnapshot = await getDocs(filesQuery);
    return querySnapshot.docs.map(doc => doc.data().file as Message['file']).filter(Boolean);
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
            handleUpdateUser={handleUpdateUser}
            handleViewProfile={handleViewProfile}
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
            handleDeleteGroup={handleDeleteGroup}
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
            handleViewProfile={handleViewProfile}
          />
          <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
          {viewedUser && (
            <UserProfileDialog
              user={viewedUser}
              currentUser={currentUser}
              onUpdateUser={handleUpdateUser}
              isOpen={!!viewedUser}
              onOpenChange={(isOpen) => !isOpen && setViewedUser(null)}
              chats={chats}
              onStartChat={handleCreateDmChat}
              onViewChat={handleSelectChat}
              getSharedFiles={getSharedFiles}
              onPreviewFile={setPreviewFile}
            />
          )}
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
