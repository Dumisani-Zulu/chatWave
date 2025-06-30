
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import type { Chat } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const groupSettingsSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
  avatar: z.string().optional().or(z.literal('')),
  description: z.string().max(200, 'Description cannot be longer than 200 characters').optional(),
});

type GroupSettingsValues = z.infer<typeof groupSettingsSchema>;

interface GroupSettingsDialogProps {
  chat: Chat;
  onUpdateGroup: (chatId: string, values: GroupSettingsValues) => void;
  setOpen: (open: boolean) => void;
}

export function GroupSettingsDialog({ chat, onUpdateGroup, setOpen }: GroupSettingsDialogProps) {
  const { toast } = useToast();

  const form = useForm<GroupSettingsValues>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: chat.name,
      avatar: chat.avatar || '',
      description: chat.description || '',
    },
  });

  function onSubmit(values: GroupSettingsValues) {
    onUpdateGroup(chat.id, values);
    toast({
      title: 'Group Updated',
      description: 'The group details have been updated successfully.',
    });
    setOpen(false);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Group Settings</DialogTitle>
        <DialogDescription>
          Update the details for '{chat.name}'.
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="h-4 w-4 mr-2" />
        <span>{chat.users.length} {chat.users.length === 1 ? 'member' : 'members'}</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Project Team" {...field} />
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
                <FormLabel>Group Avatar</FormLabel>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="pt-2">
                    <FormControl>
                      <Input placeholder="https://example.com/group-avatar.png" {...field} />
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="What is this group about?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
