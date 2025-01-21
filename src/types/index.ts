export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
}

export interface Message {
  text: string;
  isUser: boolean;
  timestamp?: number;
  error?: boolean;
}
