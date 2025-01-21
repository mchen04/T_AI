export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  timestamp?: number;
  error?: boolean;
}
