
"use client";

import * as React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface EmptyChatProps {
  currentUser: User;
  allUsers: User[];
  onStartChat: (userId: string) => void;
}

export function EmptyChat({ currentUser, allUsers, onStartChat }: EmptyChatProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
  
  const filteredUsers = otherUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-4 md:p-6 h-full">
      <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md w-full">
        <Image
          src="/logo_1.png"
          alt="ChatWave Logo"
          width={150}
          height={60}
          className=""
        />
        <h3 className="font-headline text-2xl font-bold">
          Welcome to ChatWave
        </h3>
        <p className="text-muted-foreground">
          Select a conversation or start a new one with a user below.
        </p>

        <div className="w-full pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for users to chat with..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-64 w-full mt-4">
          <div className="space-y-2 pr-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-left truncate">{user.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onStartChat(user.id)}>
                    Chat
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No users found.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
