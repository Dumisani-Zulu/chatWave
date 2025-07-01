
"use client";

import * as React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "@/components/chat/message-item";
import type { Message, User } from '@/lib/types';

interface MessageListProps {
  chatId: string;
  messages: Message[];
  currentUser: User;
  onPreviewFile: (file: Message['file']) => void;
  handleDeleteMessage: (chatId: string, messageId: string) => void;
  handleUpdateMessage: (chatId: string, messageId: string, content: string) => void;
  handleViewProfile: (user: User) => void;
}

export function MessageList({
  chatId,
  messages,
  currentUser,
  onPreviewFile,
  handleDeleteMessage,
  handleUpdateMessage,
  handleViewProfile,
}: MessageListProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4 md:p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              chatId={chatId}
              message={message}
              isCurrentUser={message.user.id === currentUser.id}
              onPreviewFile={onPreviewFile}
              handleDeleteMessage={handleDeleteMessage}
              handleUpdateMessage={handleUpdateMessage}
              handleViewProfile={handleViewProfile}
            />
          ))}
        </div>
      </ScrollArea>
    </main>
  );
}
