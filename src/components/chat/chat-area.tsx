
"use client";

import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { MessageForm } from '@/components/chat/message-form';
import { EmptyChat } from '@/components/chat/empty-chat';
import type { Chat, Message, User } from '@/lib/types';

interface ChatAreaProps {
  selectedChat: Chat | null;
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  isManageGroupOpen: boolean;
  setIsManageGroupOpen: (open: boolean) => void;
  handleUpdateGroupMembers: (chatId: string, memberIds: string[]) => void;
  isGroupSettingsOpen: boolean;
  setIsGroupSettingsOpen: (open: boolean) => void;
  handleUpdateGroupDetails: (chatId: string, details: { name: string; description?: string; avatar?: string }) => void;
  handleDeleteGroup: (chatId: string) => void;
  setPreviewFile: (file: Message['file'] | null) => void;
  messageContent: string;
  setMessageContent: (value: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleSendMessage: () => void;
  handleDeleteMessage: (chatId: string, messageId: string) => void;
  handleUpdateMessage: (chatId: string, messageId: string, content: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  conversationHistory: string;
  handleStartChat: (userId: string) => void;
}

export function ChatArea({
  selectedChat,
  currentUser,
  allUsers,
  messages,
  isManageGroupOpen,
  setIsManageGroupOpen,
  handleUpdateGroupMembers,
  isGroupSettingsOpen,
  setIsGroupSettingsOpen,
  handleUpdateGroupDetails,
  handleDeleteGroup,
  setPreviewFile,
  messageContent,
  setMessageContent,
  selectedFile,
  setSelectedFile,
  handleSendMessage,
  handleDeleteMessage,
  handleUpdateMessage,
  fileInputRef,
  conversationHistory,
  handleStartChat,
}: ChatAreaProps) {
  return (
    <SidebarInset className="flex flex-col bg-muted/30">
      {selectedChat ? (
        <>
          <ChatHeader
            selectedChat={selectedChat}
            currentUser={currentUser}
            allUsers={allUsers}
            isManageGroupOpen={isManageGroupOpen}
            setIsManageGroupOpen={setIsManageGroupOpen}
            handleUpdateGroupMembers={handleUpdateGroupMembers}
            isGroupSettingsOpen={isGroupSettingsOpen}
            setIsGroupSettingsOpen={setIsGroupSettingsOpen}
            handleUpdateGroupDetails={handleUpdateGroupDetails}
            handleDeleteGroup={handleDeleteGroup}
          />
          <MessageList
            chatId={selectedChat.id}
            messages={messages}
            currentUser={currentUser}
            onPreviewFile={setPreviewFile}
            handleDeleteMessage={handleDeleteMessage}
            handleUpdateMessage={handleUpdateMessage}
          />
          <MessageForm
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleSendMessage={handleSendMessage}
            fileInputRef={fileInputRef}
            conversationHistory={conversationHistory}
          />
        </>
      ) : (
        <EmptyChat
          currentUser={currentUser}
          allUsers={allUsers}
          onStartChat={handleStartChat}
        />
      )}
    </SidebarInset>
  );
}
