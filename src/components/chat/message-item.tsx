
"use client"

import * as React from 'react';
import { File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from '@/lib/types';

export function MessageItem({ message, isCurrentUser, onPreviewFile }: { message: Message; isCurrentUser: boolean; onPreviewFile: (file: Message['file']) => void; }) {
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
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.file && (
          <div 
            className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2 text-card-foreground transition-colors hover:bg-accent"
            onClick={() => onPreviewFile(message.file!)}
          >
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
