
"use client"

import * as React from 'react';
import { File, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Button, buttonVariants } from '@/components/ui/button';
import type { Message, User } from '@/lib/types';

interface MessageItemProps {
  chatId: string;
  message: Message;
  isCurrentUser: boolean;
  onPreviewFile: (file: Message['file']) => void;
  handleDeleteMessage: (chatId: string, messageId: string) => void;
  handleUpdateMessage: (chatId: string, messageId: string, content: string) => void;
  handleViewProfile: (user: User) => void;
}

export function MessageItem({ chatId, message, isCurrentUser, onPreviewFile, handleDeleteMessage, handleUpdateMessage, handleViewProfile }: MessageItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(message.content);

  const handleSaveEdit = () => {
    if (editedContent.trim() !== message.content) {
      handleUpdateMessage(chatId, message.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-3",
        isCurrentUser && "flex-row-reverse"
      )}
    >
      <button 
        onClick={() => handleViewProfile(message.user)} 
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={`View profile for ${message.user.name}`}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.user.avatar} alt={message.user.name} />
          <AvatarFallback>{message.user.name[0]}</AvatarFallback>
        </Avatar>
      </button>
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
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="text-card-foreground bg-card/80 h-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        ) : (
          <>
            {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
            {message.file && (
              <div 
                className={cn("flex cursor-pointer items-center gap-2 rounded-md border border-border/50 bg-background/50 p-2 text-card-foreground transition-colors hover:bg-accent", message.content && "mt-2")}
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
          </>
        )}
      </div>

      {isCurrentUser && !isEditing && (
        <div className={cn("self-center opacity-0 transition-opacity group-hover:opacity-100", isCurrentUser ? 'mr-1' : 'ml-1')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {message.content &&
                <DropdownMenuItem onClick={() => {
                    setIsEditing(true);
                    setEditedContent(message.content);
                  }}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              }
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your message.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteMessage(chatId, message.id)} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
