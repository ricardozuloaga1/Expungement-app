import React from 'react';
import { ChatMessage as ChatMessageType } from './chat-context';
import { cn } from '../../lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex items-start space-x-2",
      isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted text-muted-foreground"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "inline-block px-3 py-2 rounded-lg text-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-muted-foreground rounded-bl-sm"
        )}>
          <div className="whitespace-pre-wrap break-words">
            {formatMessageContent(message.content)}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={cn(
          "text-xs text-muted-foreground mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

// Helper function to format message content with basic markdown-like formatting
const formatMessageContent = (content: string): React.ReactNode => {
  // Split by double newlines for paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Handle bold text (**text**)
    const parts = paragraph.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIndex}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <div key={index} className={index > 0 ? "mt-2" : ""}>
        {formattedParts}
      </div>
    );
  });
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
}; 