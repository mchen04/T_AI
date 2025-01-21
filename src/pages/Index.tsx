import { useState } from "react";
import PasswordScreen from "@/components/PasswordScreen";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <ChatInterface />;
};

export default Index;