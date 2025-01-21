import { Chat } from "@/types";
import { IChatStorageService } from "./interfaces/IChatStorageService";

export class ChatStorageService implements IChatStorageService {
  private storageKey: string;
  
  constructor(storageKey: string = "chat_app_chats") {
    this.storageKey = storageKey;
  }

  async getChats(): Promise<Chat[]> {
    try {
      const chats = localStorage.getItem(this.storageKey);
      return chats ? this.validateChats(JSON.parse(chats)) : [];
    } catch (error) {
      console.error("Failed to get chats from storage:", error);
      return [];
    }
  }

  async getChat(chatId: string): Promise<Chat | null> {
    const chats = await this.getChats();
    return chats.find(chat => chat.id === chatId) || null;
  }

  async saveChat(chat: Chat): Promise<void> {
    this.validateChat(chat);
    const chats = await this.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }

    await this.saveChats(chats);
  }

  async updateChat(updatedChat: Chat): Promise<void> {
    return this.saveChat(updatedChat);
  }

  async deleteChat(chatId: string): Promise<void> {
    const chats = await this.getChats();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    await this.saveChats(updatedChats);
  }

  async clearAllChats(): Promise<void> {
    await this.saveChats([]);
  }

  private async saveChats(chats: Chat[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats:", error);
      throw new Error("Failed to save chats to storage");
    }
  }

  private validateChat(chat: Chat): void {
    if (!chat.id || typeof chat.id !== "string") {
      throw new Error("Invalid chat ID");
    }
    if (!chat.title || typeof chat.title !== "string") {
      throw new Error("Invalid chat title");
    }
    if (!Array.isArray(chat.messages)) {
      throw new Error("Invalid messages array");
    }
  }

  private validateChats(chats: Chat[]): Chat[] {
    if (!Array.isArray(chats)) {
      throw new Error("Invalid chats data");
    }
    chats.forEach(chat => this.validateChat(chat));
    return chats;
  }
}
