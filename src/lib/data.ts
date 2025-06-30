import type { User, Chat, Message } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alice', avatar: 'https://placehold.co/100x100/89CFF0/444?text=A', role: 'premium', bio: 'Lead Developer | Passionate about building beautiful UIs.' },
  { id: 'u2', name: 'Bob', avatar: 'https://placehold.co/100x100/1E90FF/FFF?text=B', role: 'admin', bio: 'Project Manager | Keeping things on track.' },
  { id: 'u3', name: 'Charlie', avatar: 'https://placehold.co/100x100/F089CF/444?text=C', role: 'moderator', bio: 'UX/UI Designer | Making things pixel-perfect.' },
  { id: 'u4', name: 'Diana', avatar: 'https://placehold.co/100x100/901EFF/FFF?text=D', role: 'free', bio: 'Marketing Specialist.' },
  { id: 'u5', name: 'Eve', avatar: 'https://placehold.co/100x100/FFC300/444?text=E', role: 'free', bio: 'Content Creator.' },
];

const generateMessages = (users: User[]): Message[] => [
  {
    id: 'm1',
    user: users[1],
    content: 'Hey everyone, welcome to the project discussion!',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'm2',
    user: users[0],
    content: "Hi Bob! Glad to be here. I've reviewed the project brief.",
    timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: 'm3',
    user: users[2],
    content: "Hello! I have some initial thoughts on the design system. Can I share the 'Design_Guidelines.pdf'?",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
   {
    id: 'm4',
    user: users[1],
    content: 'Sure, go ahead Charlie.',
    timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: 'm5',
    user: users[0],
    content: "Great! I'll take a look. By the way, I've attached the financial report.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    file: {
        name: 'Financial_Report_Q2.pdf',
        url: '#',
        size: '1.2MB',
        type: 'application/pdf',
    }
  },
];

export const mockChats: Chat[] = [
  {
    id: 'c1',
    name: '🚀 Project Alpha',
    type: 'group',
    users: [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]],
    messages: generateMessages([mockUsers[0], mockUsers[1], mockUsers[2]]),
    avatar: 'https://placehold.co/100x100/64748b/FFF?text=PA',
    description: 'Central hub for all discussions related to Project Alpha.',
  },
  {
    id: 'c2',
    name: 'Marketing Team',
    type: 'group',
    users: [mockUsers[0], mockUsers[3], mockUsers[4]],
    messages: [
      {
        id: 'm6',
        user: mockUsers[3],
        content: 'Hey team, the campaign is ready to launch!',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
    avatar: 'https://placehold.co/100x100/f59e0b/FFF?text=MT',
    description: 'Planning and execution of marketing campaigns.',
  },
  {
    id: 'c3',
    name: 'Bob',
    type: 'dm',
    users: [mockUsers[0], mockUsers[1]],
    messages: [
      {
        id: 'm7',
        user: mockUsers[1],
        content: 'Can we have a quick sync about the budget?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'm8',
        user: mockUsers[0],
        content: 'Sure, I am free in 10 minutes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
      },
    ],
  },
  {
    id: 'c4',
    name: 'Charlie',
    type: 'dm',
    users: [mockUsers[0], mockUsers[2]],
    messages: [
        {
            id: 'm9',
            user: mockUsers[2],
            content: "Here are the meeting notes from today.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            file: {
                name: "Meeting_Notes.docx",
                url: "#",
                size: "45KB",
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }
        }
    ]
  }
];

export const availableFiles = [
    'Financial_Report_Q2.pdf',
    'Project_Plan.docx',
    'Design_Guidelines.pdf',
    'User_Research_Summary.pptx',
    'Meeting_Notes.docx',
    'Budget_Spreadsheet.xlsx'
]
