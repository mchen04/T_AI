import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Pin, Search, Plus, Edit, Trash } from "lucide-react";
import { EditTitleModal, DeleteConfirmationModal } from "./ChatModals";
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChatService } from "@/services/ChatService";
import { ChatStorageService } from "@/services/ChatStorageService";
import { ChatApiService } from "@/services/ChatApiService";
import { Chat, Message } from "@/types";

const chatStorageService = new ChatStorageService();
const chatApiService = new ChatApiService({
  apiUrl: import.meta.env.VITE_DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions",
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY
});
const chatService = new ChatService(chatStorageService, chatApiService);

const ChatInterface = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  // Load initial chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        const loadedChats = await chatService.getChats();
        setChats(loadedChats);
        
        const lastChatId = localStorage.getItem("last-chat-id");
        if (lastChatId && loadedChats.some(chat => chat.id === lastChatId)) {
          setCurrentChatId(lastChatId);
        }
      } catch (error) {
        toast.error("Failed to load chats");
        console.error(error);
      }
    };
    
    loadChats();
  }, []);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      setIsLoading(true);
      const messageToSend = message;
      
      let chatId = currentChatId;
      if (!chatId) {
        // Create new chat with temporary title
        const newChat = await chatService.createChat("New Chat");
        setChats([newChat, ...chats]);
        chatId = newChat.id;
        setCurrentChatId(chatId);
      }

      // Start streaming response
      const stream = chatService.sendMessage(chatId, message);
      let finalChat: Chat | null = null;
      
      for await (const updatedChat of stream) {
        finalChat = updatedChat;
        setChats(chats => 
          chats.map(chat => 
            chat.id === currentChatId ? updatedChat : chat
          )
        );
      }

      if (finalChat) {
        // Update local storage with latest chat
        localStorage.setItem("last-chat-id", finalChat.id);
        
        // Update chat title with first message if this was a new chat
        if (!currentChatId) {
          await chatService.updateChatTitle(finalChat.id, message);
          setChats(chats => 
            chats.map(chat => 
              chat.id === finalChat.id ? {...chat, title: message} : chat
            )
          );
        }
      }
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await chatService.createChat();
      setChats([newChat, ...chats]);
      setCurrentChatId(newChat.id);
      setMessage("");
      toast.success("New chat created!", { duration: 1500 });
    } catch (error) {
      toast.error("Failed to create new chat");
      console.error(error);
    }
  };

  const handleTogglePin = async (chatId: string) => {
    try {
      const updatedChat = await chatService.togglePinChat(chatId);
      setChats(chats.map(chat => 
        chat.id === chatId ? updatedChat : chat
      ));
      toast.success(`Chat ${updatedChat.pinned ? "pinned" : "unpinned"}!`);
    } catch (error) {
      toast.error("Failed to toggle pin");
      console.error(error);
    }
  };

  const handleEditTitle = async (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
  };

  const handleDeleteChat = async (chatId: string) => {
    setDeletingChatId(chatId);
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (!editingChatId) return;
    
    if (newTitle.trim()) {
      try {
        const updatedChat = await chatService.updateChatTitle(editingChatId, newTitle);
        setChats(chats.map(chat => 
          chat.id === editingChatId ? updatedChat : chat
        ));
      } catch (error) {
        toast.error("Failed to update title");
        console.error(error);
      }
    }
    setEditingChatId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingChatId) return;
    
    try {
      if (deletingChatId === "ALL") {
        await chatService.clearAllChats();
        setChats([]);
        setCurrentChatId(null);
        toast.success("All chats cleared");
      } else {
        await chatService.deleteChat(deletingChatId);
        setChats(chats.filter(chat => chat.id !== deletingChatId));
        if (currentChatId === deletingChatId) {
          setCurrentChatId(null);
        }
        toast.success("Chat deleted");
      }
    } catch (error) {
      toast.error(deletingChatId === "ALL" ? "Failed to clear chats" : "Failed to delete chat");
      console.error(error);
    }
    setDeletingChatId(null);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingChat = editingChatId ? chats.find(chat => chat.id === editingChatId) : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-romantic-peach/50 via-romantic-pink/50 to-romantic-purple/50">
      {editingChat && (
        <EditTitleModal
          isOpen={!!editingChatId}
          initialTitle={editingChat.title}
          onSave={handleSaveTitle}
          onCancel={() => setEditingChatId(null)}
        />
      )}
      <DeleteConfirmationModal
        isOpen={!!deletingChatId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingChatId(null)}
      />
      {/* Chat History Panel */}
      <div className="w-64 border-r bg-white/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCreateChat}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
            >
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="pl-10"
            />
          </div>
          
          <Button 
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-red-500 hover:text-red-600 border-red-200"
            onClick={() => setDeletingChatId("ALL")}
          >
            <Trash size={16} className="mr-2" />
            Clear All Chats
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-160px)] px-4">
          {/* Pinned Chats */}
          {filteredChats.filter(chat => chat.pinned).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Pinned Chats</h3>
              {filteredChats
                .filter(chat => chat.pinned)
                .map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => setCurrentChatId(chat.id)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors",
                      currentChatId === chat.id && "bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-purple-400"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{chat.title}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(chat.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Pin size={16} className={cn(
                            "text-gray-400",
                            chat.pinned && "fill-current text-purple-500"
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTitle(chat.id, chat.title);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Edit size={16} className="text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Trash size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              <Separator className="my-2" />
            </div>
          )}

          {/* All Chats */}
          <div className="space-y-2">
            {filteredChats
              .filter(chat => !chat.pinned)
              .map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    setMessage("");
                  }}
                  className={cn(
                    "w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors",
                    currentChatId === chat.id && "bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-purple-400"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{chat.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(chat.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Pin size={16} className={cn(
                          "text-gray-400",
                          chat.pinned && "fill-current text-purple-500"
                        )} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTitle(chat.id, chat.title);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Edit size={16} className="text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Trash size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold">
            {currentChat?.title || "New Chat"}
          </h2>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {currentChat?.messages.map((msg, index) => {
            const isStreaming = msg.isStreaming && !msg.isUser;
            const isError = msg.isError && !msg.isUser;
            
            return (
              <div
                key={msg.id || index}
                className={cn(
                  "flex",
                  msg.isUser ? "justify-end" : "justify-start",
                  "animate-fade-in"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-4 rounded-2xl shadow-sm transition-all text-sm",
                    msg.isUser
                      ? "bg-white text-gray-800"
                      : isError
                        ? "bg-red-100 text-red-800"
                        : "bg-gradient-to-r from-pink-400 to-purple-400 text-white",
                    isStreaming && "relative overflow-hidden"
                  )}
                >
                  {msg.text}
                  {isStreaming && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                      <div className="h-full w-1/2 bg-white/50 animate-streaming" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-white/50 backdrop-blur-sm border-t">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
              disabled={isLoading}
            >
              <Send size={20} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
