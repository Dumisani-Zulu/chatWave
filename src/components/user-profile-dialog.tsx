
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User, Chat, Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, File as FileIcon, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

const userSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio cannot be longer than 160 characters').optional(),
});

type UserSettingsValues = z.infer<typeof userSettingsSchema>;

interface UserProfileDialogProps {
  user: User | null;
  currentUser: User;
  onUpdateUser: (data: Partial<User>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chats: Chat[];
  onStartChat: (userId: string) => void;
  onViewChat: (chat: Chat) => void;
  getSharedFiles: (chatId: string) => Promise<(Message['file'])[]>;
  onPreviewFile: (file: Message['file'] | null) => void;
}

export function UserProfileDialog({ 
  user, 
  currentUser, 
  onUpdateUser, 
  isOpen, 
  onOpenChange,
  chats,
  onStartChat,
  onViewChat,
  getSharedFiles,
  onPreviewFile
}: UserProfileDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [existingChat, setExistingChat] = React.useState<Chat | null>(null);
  const [sharedFiles, setSharedFiles] = React.useState<(Message['file'])[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false);

  const isCurrentUser = user?.id === currentUser.id;

  const form = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
      bio: user?.bio || '',
    },
  });
  
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        avatar: user.avatar,
        bio: user.bio || '',
      });
    }
    setIsEditing(false); 
  }, [user, form]);
  
  React.useEffect(() => {
    if (!isOpen || !user || isCurrentUser) {
      setExistingChat(null);
      setSharedFiles([]);
      return;
    }

    const findChatAndFiles = async () => {
      setIsLoadingFiles(true);
      const chat = chats.find(c => 
        c.type === 'dm' && 
        c.userIds.includes(currentUser.id) && 
        c.userIds.includes(user.id)
      );

      setExistingChat(chat || null);

      if (chat) {
        const files = await getSharedFiles(chat.id);
        setSharedFiles(files.filter(f => f) as (Message['file'])[]);
      } else {
        setSharedFiles([]);
      }
      setIsLoadingFiles(false);
    };

    findChatAndFiles();

  }, [isOpen, user, isCurrentUser, chats, currentUser.id, getSharedFiles]);


  if (!user) {
    return null;
  }

  const handleStartNewChat = () => {
    onStartChat(user.id);
    onOpenChange(false);
  };

  const handleViewConversation = () => {
    if (existingChat) {
      onViewChat(existingChat);
      onOpenChange(false);
    }
  };

  function onSubmit(values: UserSettingsValues) {
    onUpdateUser(values);
    setIsEditing(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isCurrentUser ? 'Your Profile' : 'User Profile'}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <Tabs defaultValue="url" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">URL</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="pt-2">
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </TabsContent>
                      <TabsContent value="upload" className="pt-2">
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  form.setValue('avatar', reader.result as string, { shouldValidate: true });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </TabsContent>
                    </Tabs>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a little about yourself" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 pt-4 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.bio || 'No bio available.'}</p>
              </div>
            </div>

            {!isCurrentUser && (
              <div className="pt-4 space-y-2">
                <Separator />
                <h3 className="text-sm font-medium text-muted-foreground px-1 pt-2">Shared Files</h3>
                {isLoadingFiles ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : existingChat ? (
                  sharedFiles.length > 0 ? (
                    <ScrollArea className="h-28">
                      <div className="space-y-1 pr-4">
                        {sharedFiles.map((file, index) => (
                           <button 
                            key={index} 
                            onClick={() => onPreviewFile(file)} 
                            className="flex w-full text-left items-center gap-2 rounded-md p-2 text-sm hover:bg-muted"
                          >
                            <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{file?.name}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-6">
                      No files shared yet.
                    </div>
                  )
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-6">
                    Start a conversation to share files.
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-6">
              {isCurrentUser ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                  {existingChat ? (
                    <Button onClick={handleViewConversation}>View Conversation</Button>
                  ) : (
                    <Button onClick={handleStartNewChat} disabled={isLoadingFiles}>Start Chat</Button>
                  )}
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
