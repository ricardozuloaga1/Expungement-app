import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  email: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface UserContext {
  hasAssessment: boolean;
  assessmentType?: string;
  eligibilityStatus?: string;
  currentStep?: number;
  convictionState?: string;
  questionnaireData?: {
    convictionState?: string;
    hasMarijuanaConviction?: string;
    offenseTypes?: string[];
    convictionYear?: string;
    convictionMonth?: string;
    possessionAmount?: string;
    ageAtOffense?: string;
    convictionLevel?: string;
    otherConvictions?: string;
    completed?: boolean;
  };
  eligibilityResults?: {
    automaticExpungement?: boolean;
    automaticSealing?: boolean;
    petitionBasedSealing?: boolean;
    primaryReason?: string;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  userContext: UserContext;
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
  updateUserContext: (context: Partial<UserContext>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    hasAssessment: false
  });
  
  const { user } = useAuth();
  const typedUser = user as User | undefined;

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typedUser?.id) {
      const savedMessages = localStorage.getItem(`chat_history_${typedUser.id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    }
  }, [typedUser]);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (typedUser?.id && messages.length > 0) {
      localStorage.setItem(`chat_history_${typedUser.id}`, JSON.stringify(messages));
    }
  }, [messages, typedUser]);

  // Initialize with welcome message
  useEffect(() => {
    if (typedUser && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: "Hi! I'm here to help with questions about New York marijuana expungement and sealing laws. I can explain MRTA 2021, Clean Slate Act, and petition-based sealing processes.\n\n**Please note:** I provide general legal information only, not specific legal advice. For case-specific guidance, consult with a qualified attorney.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          userContext,
          chatHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again later or contact support if the issue persists.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const clearChat = () => {
    if (typedUser?.id) {
      localStorage.removeItem(`chat_history_${typedUser.id}`);
    }
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: "Hi! I'm here to help with questions about New York marijuana expungement and sealing laws. I can explain MRTA 2021, Clean Slate Act, and petition-based sealing processes.\n\n**Please note:** I provide general legal information only, not specific legal advice. For case-specific guidance, consult with a qualified attorney.",
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const updateUserContext = (context: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...context }));
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      isTyping,
      userContext,
      sendMessage,
      toggleChat,
      clearChat,
      updateUserContext
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 