import { Injectable } from '@nestjs/common';

export interface UserInfo {
  name: string;
  role: string;
  company?: string;
  type: 'employer' | 'worker';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userInfo: UserInfo;
  message: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  employerId: string | null;
  workerId: string | null;
  isActive: boolean;
  status: 'pending' | 'active' | 'contract' | 'completed' | 'declined';
  messages: ChatMessage[];
}

@Injectable()
export class ChatService {
  private chats: Map<string, Chat> = new Map();
  private users: Map<string, UserInfo> = new Map();

  createChat(chatId: string): Chat {

    console.log({chatId});

    const chat: Chat = {
      id: chatId,
      employerId: null,
      workerId: null,
      isActive: true,
      status: 'active',
      messages: [],
    };

    this.chats.set(chatId, chat);
    return chat;
  }

  setUserInfo(userId: string, userInfo: UserInfo) {
    this.users.set(userId, userInfo);
    
    // Update chat with user role
    for (const [chatId, chat] of this.chats.entries()) {
      if (userInfo.type === 'employer' && !chat.employerId) {
        chat.employerId = userId;
      } else if (userInfo.type === 'worker' && !chat.workerId) {
        chat.workerId = userId;
      }
    }
  }

  getUserInfo(userId: string): UserInfo | undefined {
    return this.users.get(userId);
  }

  getChatById(chatId: string): Chat {
    if (!this.chats.has(chatId)) {
      return this.createChat(chatId);
    }
    return this.chats.get(chatId)!;
  }

  addMessage(chatId: string, userId: string, message: string): ChatMessage | null {
    const chat = this.getChatById(chatId);
    const userInfo = this.getUserInfo(userId);

    if (!chat || !userInfo) return null;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userInfo,
      message,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    return newMessage;
  }

  acceptJob(chatId: string): Chat {
    const chat = this.getChatById(chatId);
    chat.isActive = true;
    chat.status = 'active';
    return chat;
  }

  declineJob(chatId: string): Chat {
    const chat = this.getChatById(chatId);
    chat.isActive = false;
    chat.status = 'declined';
    return chat;
  }

  sendContract(chatId: string): Chat {
    const chat = this.getChatById(chatId);
    chat.status = 'contract';
    return chat;
  }

  signContract(chatId: string): Chat {
    const chat = this.getChatById(chatId);
    chat.status = 'completed';
    return chat;
  }

  declineContract(chatId: string): Chat {
    const chat = this.getChatById(chatId);
    chat.status = 'declined';
    chat.isActive = false;
    return chat;
  }
}