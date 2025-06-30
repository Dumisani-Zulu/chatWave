export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: 'admin' | 'moderator' | 'premium' | 'free';
}

export interface Message {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  file?: {
    name: string;
    url: string;
    size: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  type: 'dm' | 'group';
  users: User[];
  messages: Message[];
}
