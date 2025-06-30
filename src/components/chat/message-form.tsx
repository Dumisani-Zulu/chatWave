
"use client";

import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';
import { File, Paperclip, Send, Smile, X } from 'lucide-react';

import { AiFileSuggester } from "@/components/ai-file-suggester";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageFormProps {
  messageContent: string;
  setMessageContent: (value: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleSendMessage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  conversationHistory: string;
}

export function MessageForm({
  messageContent,
  setMessageContent,
  selectedFile,
  setSelectedFile,
  handleSendMessage,
  fileInputRef,
  conversationHistory
}: MessageFormProps) {
  return (
    <footer className="border-t bg-background p-4">
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted/50 p-2 text-sm">
          <div className="flex items-center gap-2 font-medium truncate">
            <File className="h-5 w-5 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedFile(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="relative">
        <Textarea
          placeholder="Type a message..."
          className="min-h-[48px] resize-none rounded-2xl pr-28"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-auto p-0 border-0 mb-1">
              <EmojiPicker
                onEmojiClick={(emojiObject) => setMessageContent(prev => prev + emojiObject.emoji)}
                pickerStyle={{ width: '100%' }}
              />
            </PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          <Button
            size="icon"
            className="h-8 w-8"
            onClick={handleSendMessage}
            disabled={!messageContent.trim() && !selectedFile}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <AiFileSuggester conversationHistory={conversationHistory} />
    </footer>
  );
}
