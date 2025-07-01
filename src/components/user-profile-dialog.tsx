
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
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
}

export function UserProfileDialog({ user, currentUser, onUpdateUser, isOpen, onOpenChange }: UserProfileDialogProps) {
  const [isEditing, setIsEditing] = React.useState(false);
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
    // When dialog opens for a new user, reset editing state
    setIsEditing(false); 
  }, [user, form]);

  if (!user) {
    return null;
  }

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

        {!isEditing ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.bio || 'No bio available.'}</p>
            </div>
            {isCurrentUser && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
