
"use client";

import * as React from 'react';
import { MoreVertical, Settings, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { GroupSettingsDialog } from "@/components/group-settings-dialog";
import { ManageGroupDialog } from "@/components/manage-group-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Chat, User } from '@/lib/types';

interface ChatHeaderProps {
  selectedChat: Chat;
  currentUser: User;
  isManageGroupOpen: boolean;
  setIsManageGroupOpen: (open: boolean) => void;
  handleUpdateGroupMembers: (chatId: string, memberIds: string[]) => void;
  isGroupSettingsOpen: boolean;
  setIsGroupSettingsOpen: (open: boolean) => void;
  handleUpdateGroupDetails: (chatId: string, details: { name: string; description?: string; avatar?: string }) => void;
}

export function ChatHeader({
  selectedChat,
  currentUser,
  isManageGroupOpen,
  setIsManageGroupOpen,
  handleUpdateGroupMembers,
  isGroupSettingsOpen,
  setIsGroupSettingsOpen,
  handleUpdateGroupDetails,
}: ChatHeaderProps) {
  return (
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
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog open={isManageGroupOpen} onOpenChange={setIsManageGroupOpen}>
              <DialogTrigger asChild>
                {selectedChat.type === 'group' && (
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Manage Members</span>
                  </DropdownMenuItem>
                )}
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
                {selectedChat.type === 'group' && (
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Group Settings</span>
                  </DropdownMenuItem>
                )}
              </DialogTrigger>
              <GroupSettingsDialog
                chat={selectedChat}
                onUpdateGroup={handleUpdateGroupDetails}
                setOpen={setIsGroupSettingsOpen}
              />
            </Dialog>
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
  );
}
