import { Chat } from "@/types";

export interface IChatService {
  getChats(): Promise<Chat[]>;
  createChat(initialMessage?: string): Promise<Chat>;
  sendMessage(chatId: string, message: string): AsyncGenerator<Chat>;
  togglePinChat(chatId: string): Promise<Chat>;
  updateChatTitle(chatId: string, newTitle: string): Promise<Chat>;
  deleteChat(chatId: string): Promise<void>;
  clearAllChats(): Promise<void>;
}
