
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
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/data';
import type { Chat, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const manageGroupSchema = z.object({
  members: z.array(z.string()),
});

interface ManageGroupDialogProps {
  chat: Chat;
  currentUser: User;
  onUpdateGroup: (chatId: string, memberIds: string[]) => void;
  setOpen: (open: boolean) => void;
}

export function ManageGroupDialog({ chat, currentUser, onUpdateGroup, setOpen }: ManageGroupDialogProps) {
  const { toast } = useToast();
  const otherUsers = mockUsers.filter((user) => user.id !== currentUser.id);
  const currentMemberIds = chat.users.map(u => u.id);

  const form = useForm<z.infer<typeof manageGroupSchema>>({
    resolver: zodResolver(manageGroupSchema),
    defaultValues: {
      members: currentMemberIds.filter(id => id !== currentUser.id),
    },
  });

  function onSubmit(values: z.infer<typeof manageGroupSchema>) {
    const allMemberIds = [currentUser.id, ...values.members];
    onUpdateGroup(chat.id, allMemberIds);
    toast({
        title: 'Group updated',
        description: 'The member list has been updated successfully.'
    });
    setOpen(false);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Manage Members</DialogTitle>
        <DialogDescription>
          Add or remove members from '{chat.name}'.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="members"
            render={() => (
              <FormItem>
                <FormLabel>Members</FormLabel>
                <ScrollArea className="h-40 rounded-md border">
                  <div className="p-4 space-y-2">
                    {otherUsers.map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="members"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={user.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), user.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span>{user.name}</span>
                                </div>
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
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
