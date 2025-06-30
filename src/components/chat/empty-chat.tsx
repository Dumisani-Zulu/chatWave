
"use client";

import { MessageCircle } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <MessageCircle className="h-16 w-16 text-muted-foreground" />
      <h3 className="font-headline text-2xl font-bold">
        Welcome to ChatWave
      </h3>
      <p className="text-muted-foreground">
        Select a conversation to start chatting.
      </p>
    </div>
  );
}
