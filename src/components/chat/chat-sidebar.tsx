
"use client";

import * as React from 'react';
import { PlusCircle, Search } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateGroupDialog } from '@/components/create-group-dialog';
import { Logo } from '@/components/logo';
import type { Chat, User } from '@/lib/types';

interface ChatSidebarProps {
  currentUser: User;
  chats: Chat[];
  allUsers: User[];
  selectedChat: Chat | null;
  handleSelectChat: (chat: Chat) => void;
  isCreateGroupOpen: boolean;
  setIsCreateGroupOpen: (open: boolean) => void;
  handleCreateGroup: (name: string, memberIds: string[]) => void;
  handleUpdateUser: (updatedUser: Partial<User>) => void;
  handleViewProfile: (user: User) => void;
}

export function ChatSidebar({
  currentUser,
  chats,
  allUsers,
  selectedChat,
  handleSelectChat,
  isCreateGroupOpen,
  setIsCreateGroupOpen,
  handleCreateGroup,
  handleUpdateUser,
  handleViewProfile,
}: ChatSidebarProps) {
  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => {
      const dateA = a.lastMessageAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.lastMessageAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [chats]);

  return (
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
                  {sortedChats
                    .filter((c) => c.type === "dm")
                    .map((chat) => {
                      const otherUser = chat.users.find(
                        (u) => u.id !== currentUser.id
                      );
                      return (
                        <SidebarMenuItem key={chat.id}>
                          <SidebarMenuButton
                            onClick={() => handleSelectChat(chat)}
                            isActive={selectedChat?.id === chat.id}
                            className="justify-start"
                            tooltip={otherUser?.name}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                              <AvatarFallback>{otherUser?.name?.[0]}</AvatarFallback>
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
                        allUsers={allUsers}
                        onCreateGroup={handleCreateGroup}
                        setOpen={setIsCreateGroupOpen}
                      />
                    </Dialog>
                  </SidebarGroupLabel>
                  {sortedChats
                    .filter((c) => c.type === "group")
                    .map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          onClick={() => handleSelectChat(chat)}
                          isActive={selectedChat?.id === chat.id}
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
        <div
          className="flex cursor-pointer items-center gap-2 overflow-hidden p-2 rounded-md hover:bg-sidebar-accent"
          onClick={() => handleViewProfile(currentUser)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === 'Enter' || e.key === ' ') && handleViewProfile(currentUser)
          }
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden text-sm">
            <span className="font-semibold truncate">{currentUser.name}</span>
            <span
              className="truncate text-xs text-muted-foreground"
              title={currentUser.bio}
            >
              {currentUser.bio || 'No bio'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
