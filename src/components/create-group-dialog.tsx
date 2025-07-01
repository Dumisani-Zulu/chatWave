
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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
  members: z.array(z.string()).min(1, 'You must select at least one other member'),
});

interface CreateGroupDialogProps {
  currentUser: User;
  allUsers: User[];
  onCreateGroup: (name: string, memberIds: string[]) => void;
  setOpen: (open: boolean) => void;
}

export function CreateGroupDialog({ currentUser, allUsers, onCreateGroup, setOpen }: CreateGroupDialogProps) {
  const otherUsers = allUsers.filter((user) => user.id !== currentUser.id);

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  function onSubmit(values: z.infer<typeof createGroupSchema>) {
    onCreateGroup(values.name, values.members);
    form.reset();
    setOpen(false);
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogDescription>
          You are automatically included. Select other members to add to the group.
        </DialogDescription>
      </DialogHeader>
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
            name="members"
            render={() => (
              <FormItem>
                <FormLabel>Members</FormLabel>
                <ScrollArea className="h-40 rounded-md border">
                  <div className="p-4 space-y-2">
                    <div className="flex flex-row items-center space-x-3 space-y-0 opacity-75">
                        <Checkbox
                            id="current-user"
                            checked={true}
                            disabled={true}
                        />
                        <FormLabel htmlFor='current-user' className="font-normal w-full cursor-not-allowed">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                                </Avatar>
                                <span>{currentUser.name} (You)</span>
                            </div>
                        </FormLabel>
                    </div>
                    <Separator className="my-2" />
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
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
