
"use client";

import * as React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageItem } from "@/components/chat/message-item";
import type { Message, User } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  onPreviewFile: (file: Message['file']) => void;
}

export function MessageList({ messages, currentUser, onPreviewFile }: MessageListProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4 md:p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={message.user.id === currentUser.id}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </div>
      </ScrollArea>
    </main>
  );
}
