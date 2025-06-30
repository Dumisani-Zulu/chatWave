
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
  Users,
} from "lucide-react";

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
import { mockUsers, mockChats, Chat, User, Message } from "@/lib/data";
import { Logo } from "@/components/logo";
import { AiFileSuggester } from "@/components/ai-file-suggester";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CreateGroupDialog } from "@/components/create-group-dialog";
import { ManageGroupDialog } from "@/components/manage-group-dialog";

const currentUser = mockUsers[0];

export default function ChatPage() {
  const [chats, setChats] = React.useState<Chat[]>(mockChats);
  const [selectedChat, setSelectedChat] = React.useState<Chat>(chats[0]);
  const [messages, setMessages] = React.useState<Message[]>(
    selectedChat.messages
  );
  const [isCreateGroupOpen, setIsCreateGroupOpen] = React.useState(false);
  const [isManageGroupOpen, setIsManageGroupOpen] = React.useState(false);

  React.useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      user: currentUser,
      content,
      timestamp: new Date().toISOString(),
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
  };

  const handleCreateGroup = (name: string, memberIds: string[]) => {
    const newGroup: Chat = {
      id: `c${Date.now()}`,
      name,
      type: "group",
      users: mockUsers.filter((u) => memberIds.includes(u.id)),
      messages: [],
    };
    const newChats = [newGroup, ...chats];
    setChats(newChats);
    setSelectedChat(newGroup);
    setIsCreateGroupOpen(false);
  };

  const handleUpdateGroup = (chatId: string, memberIds: string[]) => {
    const newChats = chats.map((chat) => {
      if (chat.id === chatId) {
        return {
          ...chat,
          users: mockUsers.filter((u) => memberIds.includes(u.id)),
        };
      }
      return chat;
    });
    setChats(newChats);
    const updatedChat = newChats.find((chat) => chat.id === selectedChat.id);
    if (updatedChat) {
      setSelectedChat(updatedChat);
    }
    setIsManageGroupOpen(false);
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
          <SidebarContent>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
            </div>
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
                <ScrollArea className="h-48">
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
                            <AvatarFallback>{chat.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{chat.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </ScrollArea>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Direct Messages</SidebarGroupLabel>
                 <ScrollArea className="h-48">
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
                  </ScrollArea>
              </SidebarGroup>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Online
                  </span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col bg-muted/30">
          {selectedChat ? (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="md:hidden" />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {selectedChat.type === "dm"
                        ? selectedChat.users.find(
                            (u) => u.id !== currentUser.id
                          )?.name[0]
                        : selectedChat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold font-headline">
                      {selectedChat.type === "dm"
                        ? selectedChat.users.find(
                            (u) => u.id !== currentUser.id
                          )?.name
                        : selectedChat.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.users.length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedChat.type === 'group' && (
                    <Dialog open={isManageGroupOpen} onOpenChange={setIsManageGroupOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Users className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <ManageGroupDialog
                        chat={selectedChat}
                        currentUser={currentUser}
                        onUpdateGroup={handleUpdateGroup}
                        setOpen={setIsManageGroupOpen}
                      />
                    </Dialog>
                  )}
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
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
                <div className="relative">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-[48px] resize-none rounded-2xl pr-24"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      size="icon"
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea?.value) {
                            handleSendMessage(textarea.value);
                            textarea.value = '';
                        }
                      }}
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
