
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
  editedAt?: any;
}

export interface Chat {
  id: string;
  name: string;
  type: 'dm' | 'group';
  users: User[]; // This is constructed on the client
  userIds: string[]; // This comes from firestore
  avatar?: string;
  description?: string;
  createdBy?: string;
  createdAt?: any;
  lastMessageAt?: any;
}
