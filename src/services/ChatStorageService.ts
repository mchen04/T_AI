import { Chat } from "@/types";

const CHAT_STORAGE_KEY = "chat_app_chats";

export class ChatStorageService {
  async getChats(): Promise<Chat[]> {
    try {
      const chats = localStorage.getItem(CHAT_STORAGE_KEY);
      return chats ? JSON.parse(chats) : [];
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
    const chats = await this.getChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.push(chat);
    }

    await this.saveAllChats(chats);
  }

  async updateChat(updatedChat: Chat): Promise<void> {
    return this.saveChat(updatedChat);
  }

  async deleteChat(chatId: string): Promise<void> {
    const chats = await this.getChats();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    await this.saveAllChats(filteredChats);
  }

  private async saveAllChats(chats: Chat[]): Promise<void> {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats:", error);
      throw new Error("Failed to save chats to storage");
    }
  }
}
