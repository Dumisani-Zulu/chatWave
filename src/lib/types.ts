export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
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
    type: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  type: 'dm' | 'group';
  users: User[];
  messages: Message[];
  avatar?: string;
  description?: string;
}
