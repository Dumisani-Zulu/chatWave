
"use client";

import * as React from "react";
import Link from "next/link";
import {
  File,
  MessageCircle,
  MoreVertical,
  Paperclip,
  PlusCircle,
  Search,
  Send,
  Settings,
  Smile,
  Users,
  X,
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';


import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { mockUsers, mockChats, Chat, User, Message } from "@/lib/data";
import { Logo } from "@/components/logo";
import { AiFileSuggester } from "@/components/ai-file-suggester";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { ManageGroupDialog } from "@/components/manage-group-dialog";
import { UserSettingsDialog } from "@/components/user-settings-dialog";
import { GroupSettingsDialog } from "@/components/group-settings-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ChatPage() {
  const [currentUser, setCurrentUser] = React.useState<User>(mockUsers[0]);
  const [chats, setChats] = React.useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = React.useState<Chat>(chats[0]);
  const [messages, setMessages] = React.useState<Message[]>(
    selectedChat.messages
  );
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = React.useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = React.useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  React.useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = () => {
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
    const updatedSelectedChat = updatedChats.find((chat) => chat.id === selectedChat.id);
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
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 font-headline text-lg font-bold">
              <Logo className="h-6 w-6 text-primary" />
              <span>ChatWave</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex flex-col">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
            </div>
            <Tabs defaultValue="chats" className="flex flex-1 flex-col overflow-hidden">
              <div className="px-2">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                </TabsList>
              </div>
              <ScrollArea className="flex-1">
                <TabsContent value="chats" className="mt-0">
                  <SidebarMenu>
                    <SidebarGroup>
                      <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                      {chats
                        .filter((c) => c.type === "dm")
                        .map((chat) => {
                          const otherUser = chat.users.find(
                            (u) => u.id !== currentUser.id
                          );
                          return (
                            <SidebarMenuItem key={chat.id}>
                              <SidebarMenuButton
                                onClick={() => handleSelectChat(chat)}
                                isActive={selectedChat.id === chat.id}
                                className="justify-start"
                                tooltip={otherUser?.name}
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                                  <AvatarFallback>{otherUser?.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="truncate">{otherUser?.name}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                    </SidebarGroup>
                  </SidebarMenu>
                </TabsContent>
                <TabsContent value="groups" className="mt-0">
                  <SidebarMenu>
                    <SidebarGroup>
                      <SidebarGroupLabel className="flex items-center justify-between">
                        <span>Groups</span>
                        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <CreateGroupDialog 
                            currentUser={currentUser} 
                            onCreateGroup={handleCreateGroup} 
                            setOpen={setIsCreateGroupOpen}
                          />
                        </Dialog>
                      </SidebarGroupLabel>
                      {chats
                        .filter((c) => c.type === "group")
                        .map((chat) => (
                          <SidebarMenuItem key={chat.id}>
                            <SidebarMenuButton
                              onClick={() => handleSelectChat(chat)}
                              isActive={selectedChat.id === chat.id}
                              className="justify-start"
                              tooltip={chat.name}
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={chat.avatar} alt={chat.name} />
                                <AvatarFallback>{chat.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="truncate">{chat.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarGroup>
                  </SidebarMenu>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm overflow-hidden">
                  <span className="font-semibold truncate">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground truncate" title={currentUser.bio}>
                    {currentUser.bio || "No bio"}
                  </span>
                </div>
              </div>
              <Dialog open={isUserSettingsOpen} onOpenChange={setIsUserSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <UserSettingsDialog 
                  currentUser={currentUser} 
                  onUpdateUser={handleUpdateUser}
                  setOpen={setIsUserSettingsOpen}
                />
              </Dialog>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col bg-muted/30">
          {selectedChat ? (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <SidebarTrigger className="md:hidden" />
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage 
                      src={selectedChat.type === 'dm' ? selectedChat.users.find(u => u.id !== currentUser.id)?.avatar : selectedChat.avatar} 
                      alt={selectedChat.name} />
                    <AvatarFallback>
                      {selectedChat.type === "dm"
                        ? selectedChat.users.find(
                            (u) => u.id !== currentUser.id
                          )?.name[0]
                        : selectedChat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h2 className="font-semibold font-headline truncate">
                      {selectedChat.type === "dm"
                        ? selectedChat.users.find(
                            (u) => u.id !== currentUser.id
                          )?.name
                        : selectedChat.name}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedChat.type === 'group' 
                        ? (selectedChat.description || `${selectedChat.users.length} members`)
                        : (selectedChat.users.find(u => u.id !== currentUser.id)?.bio || 'Online')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       {selectedChat.type === 'group' && (
                        <>
                          <Dialog open={isManageGroupOpen} onOpenChange={setIsManageGroupOpen}>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Manage Members</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <ManageGroupDialog
                              chat={selectedChat}
                              currentUser={currentUser}
                              onUpdateGroup={handleUpdateGroupMembers}
                              setOpen={setIsManageGroupOpen}
                            />
                          </Dialog>
                          <Dialog open={isGroupSettingsOpen} onOpenChange={setIsGroupSettingsOpen}>
                            <DialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Group Settings</span>
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <GroupSettingsDialog
                              chat={selectedChat}
                              onUpdateGroup={handleUpdateGroupDetails}
                              setOpen={setIsGroupSettingsOpen}
                            />
                          </Dialog>
                        </>
                       )}
                       {selectedChat.type === 'dm' && (
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                       )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>

              <main className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4 md:p-6">
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        isCurrentUser={message.user.id === currentUser.id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </main>

              <footer className="border-t bg-background p-4">
                {selectedFile && (
                  <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-sm">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <File className="h-5 w-5 shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="relative">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[48px] resize-none rounded-2xl pr-28"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Smile className="h-5 w-5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="end" className="w-auto p-0 border-0 mb-1">
                          <EmojiPicker 
                            onEmojiClick={(emojiObject) => setMessageContent(prev => prev + emojiObject.emoji)} 
                            pickerStyle={{width: '100%'}}
                          />
                        </PopoverContent>
                      </Popover>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() && !selectedFile}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <AiFileSuggester conversationHistory={conversationHistory} />
              </footer>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground" />
              <h3 className="font-headline text-2xl font-bold">
                Welcome to ChatWave
              </h3>
              <p className="text-muted-foreground">
                Select a conversation to start chatting.
              </p>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function MessageItem({ message, isCurrentUser }: { message: Message, isCurrentUser: boolean }) {
  React.useEffect(() => {
    const fileUrl = message.file?.url;
    if (fileUrl && fileUrl.startsWith('blob:')) {
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    }
  }, [message.file?.url]);
  
  return (
    <div
      className={cn(
        "flex items-start gap-3",
        isCurrentUser && "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.avatar} alt={message.user.name} />
        <AvatarFallback>{message.user.name[0]}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-md rounded-lg p-3",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-medium mb-1",
            isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          <span>{message.user.name}</span>
          {message.user.role && (
            <Badge
              variant={isCurrentUser ? "secondary" : "default"}
              className="capitalize"
            >
              {message.user.role}
            </Badge>
          )}
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.file && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2 text-card-foreground">
            <File className="h-5 w-5 shrink-0" />
            <span className="text-sm truncate">{message.file.name}</span>
          </div>
        )}
        <p
          className={cn(
            "mt-1 text-xs",
            isCurrentUser
              ? "text-primary-foreground/60"
              : "text-muted-foreground"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
