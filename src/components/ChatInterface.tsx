import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Pin, Search, Settings, Plus } from "lucide-react";
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Chat = {
  id: string;
  title: string;
  messages: Array<{ text: string; isUser: boolean }>;
  pinned: boolean;
  createdAt: number;
};

const ChatInterface = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("tianna-chats");
    if (savedChats) {
      setChats(JSON.parse(savedChats));
      const lastChat = JSON.parse(savedChats).find((chat: Chat) => chat.id === localStorage.getItem("last-chat-id"));
      if (lastChat) {
        setCurrentChatId(lastChat.id);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tianna-chats", JSON.stringify(chats));
    if (currentChatId) {
      localStorage.setItem("last-chat-id", currentChatId);
    }
  }, [chats, currentChatId]);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!currentChatId) {
      createNewChat();
      return;
    }

    // Add user message
    const updatedChats = chats.map(chat => 
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, { text: message, isUser: true }] }
        : chat
    );
    setChats(updatedChats);
    setMessage("");
    setIsLoading(true);

    try {
      if (!import.meta.env.VITE_DEEPSEEK_API_KEY) {
        throw new Error("Deepseek API key not configured");
      }

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      const updatedChatsWithResponse = updatedChats.map(chat => 
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, { text: aiMessage, isUser: false }] }
          : chat
      );
      setChats(updatedChatsWithResponse);
    } catch (error) {
      const updatedChatsWithError = updatedChats.map(chat => 
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, { text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.", isUser: false }] }
          : chat
      );
      setChats(updatedChatsWithError);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      pinned: false,
      createdAt: Date.now()
    };
    setChats([newChat, ...chats]);
    setCurrentChatId(newChat.id);
    toast.success("New chat created!", { duration: 1500 });
  };

  const togglePinChat = (chatId: string) => {
    const updatedChats = chats.map(chat => 
      chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
    );
    setChats(updatedChats);
    toast.success(`Chat ${updatedChats.find(chat => chat.id === chatId)?.pinned ? "pinned" : "unpinned"}!`, { duration: 1500 });
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-romantic-peach/50 via-romantic-pink/50 to-romantic-purple/50">
      {/* Chat History Panel */}
      <div className="w-80 border-r bg-white/50 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
              <Button onClick={createNewChat} className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500" variant="default">
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
                      currentChatId === chat.id && "bg-gray-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{chat.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinChat(chat.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Pin size={16} className={cn(
                          "text-gray-400",
                          chat.pinned && "fill-current text-purple-500"
                        )} />
                      </button>
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
                  onClick={() => setCurrentChatId(chat.id)}
                  className={cn(
                    "w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors",
                    currentChatId === chat.id && "bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{chat.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinChat(chat.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <Pin size={16} className={cn(
                        "text-gray-400",
                        chat.pinned && "fill-current text-purple-500"
                      )} />
                    </button>
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {currentChat?.title || "New Chat"}
            </h2>
            <Button variant="ghost" size="icon">
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-4">
          {currentChat?.messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex",
                msg.isUser ? "justify-end" : "justify-start",
                "animate-fade-in"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl shadow-sm transition-all",
                  msg.isUser
                    ? "bg-white text-gray-800"
                    : "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
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
