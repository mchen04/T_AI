export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
}

export interface ChatApiConfig {
  apiUrl: string;
  apiKey: string;
  model?: string;
  temperature?: number;
}
