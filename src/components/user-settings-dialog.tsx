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
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const userSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio cannot be longer than 160 characters').optional(),
});

interface UserSettingsDialogProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  setOpen: (open: boolean) => void;
}

export function UserSettingsDialog({ currentUser, onUpdateUser, setOpen }: UserSettingsDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: currentUser.name,
      avatar: currentUser.avatar,
      bio: currentUser.bio || '',
    },
  });

  function onSubmit(values: z.infer<typeof userSettingsSchema>) {
    const updatedUser = {
        ...currentUser,
        ...values,
        avatar: values.avatar || currentUser.avatar,
    };
    onUpdateUser(updatedUser);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
    setOpen(false);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Profile Settings</DialogTitle>
        <DialogDescription>
          Update your profile information here.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.png" {...field} />
                </FormControl>
                <FormMessage />
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
