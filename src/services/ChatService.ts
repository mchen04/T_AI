import { Chat } from "@/types";
import { ChatStorageService } from "./ChatStorageService";
import { ChatApiService } from "./ChatApiService";

export class ChatService {
  private storageService: ChatStorageService;
  private apiService: ChatApiService;

  constructor(storageService: ChatStorageService, apiService: ChatApiService) {
    this.storageService = storageService;
    this.apiService = apiService;
  }

  async getChats(): Promise<Chat[]> {
    return this.storageService.getChats();
  }

  async createChat(initialMessage?: string): Promise<Chat> {
    const newChat = {
      id: crypto.randomUUID(),
      title: initialMessage 
        ? initialMessage.length > 50 
          ? `${initialMessage.slice(0, 47)}...`
          : initialMessage
        : "New Chat",
      messages: [],
      pinned: false,
      createdAt: Date.now()
    };
    
    await this.storageService.saveChat(newChat);
    return newChat;
  }

  async sendMessage(chatId: string, message: string): Promise<Chat> {
    const chat = await this.storageService.getChat(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Add user message
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, { text: message, isUser: true }]
    };
    await this.storageService.updateChat(updatedChat);

    try {
      const aiResponse = await this.apiService.sendMessage(message);
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, { text: aiResponse, isUser: false }]
      };
      await this.storageService.updateChat(finalChat);
      return finalChat;
    } catch (error) {
      const errorChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, { 
          text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.", 
          isUser: false 
        }]
      };
      await this.storageService.updateChat(errorChat);
      throw error;
    }
  }

  async togglePinChat(chatId: string): Promise<Chat> {
    const chat = await this.storageService.getChat(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const updatedChat = {
      ...chat,
      pinned: !chat.pinned
    };
    await this.storageService.updateChat(updatedChat);
    return updatedChat;
  }

  async updateChatTitle(chatId: string, newTitle: string): Promise<Chat> {
    const chat = await this.storageService.getChat(chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    const updatedChat = {
      ...chat,
      title: newTitle
    };
    await this.storageService.updateChat(updatedChat);
    return updatedChat;
  }

  async deleteChat(chatId: string): Promise<void> {
    await this.storageService.deleteChat(chatId);
  }
}
