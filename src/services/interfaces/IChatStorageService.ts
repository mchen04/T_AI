import { Chat } from "@/types";

export interface IChatStorageService {
  getChats(): Promise<Chat[]>;
  getChat(chatId: string): Promise<Chat | null>;
  saveChat(chat: Chat): Promise<void>;
  updateChat(updatedChat: Chat): Promise<void>;
  deleteChat(chatId: string): Promise<void>;
  clearAllChats(): Promise<void>;
}
