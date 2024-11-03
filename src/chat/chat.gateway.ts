import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService, UserInfo } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('setUserInfo')
  handleSetUserInfo(
    @MessageBody() data: { userId: string; userInfo: UserInfo },
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.setUserInfo(data.userId, data.userInfo);
    client.join(data.userId);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const chat = this.chatService.getChatById(data.chatId);
    client.join(data.chatId);

    // Send previous messages
    chat.messages.forEach(message => {
      client.emit('message', message);
    });

    return { event: 'joinedChat', data: chat };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { chatId: string; message: string; userId: string },
  ) {
    const chat = this.chatService.getChatById(data.chatId);
    if (!chat || !chat.isActive) {
      return { error: 'Chat is not active' };
    }

    const message = this.chatService.addMessage(data.chatId, data.userId, data.message);
    if (message) {
      this.server.to(data.chatId).emit('message', message);
    }
  }

  @SubscribeMessage('acceptJob')
  handleAcceptJob(@MessageBody() data: { chatId: string; userId: string }) {
    const chat = this.chatService.acceptJob(data.chatId);
    this.server.to(data.chatId).emit('jobAccepted', {
      message: 'Job request accepted',
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('declineJob')
  handleDeclineJob(@MessageBody() data: { chatId: string; userId: string }) {
    const chat = this.chatService.declineJob(data.chatId);
    this.server.to(data.chatId).emit('jobDeclined', {
      message: 'Job request declined',
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('sendContract')
  handleSendContract(@MessageBody() data: { chatId: string; userId: string }) {
    const chat = this.chatService.sendContract(data.chatId);
    this.server.to(data.chatId).emit('contractSent', {
      message: 'Contract sent for review',
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('signContract')
  handleSignContract(@MessageBody() data: { chatId: string; userId: string }) {
    const chat = this.chatService.signContract(data.chatId);
    this.server.to(data.chatId).emit('contractSigned', {
      message: 'Contract signed',
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('declineContract')
  handleDeclineContract(@MessageBody() data: { chatId: string; userId: string }) {
    const chat = this.chatService.declineContract(data.chatId);
    this.server.to(data.chatId).emit('contractDeclined', {
      message: 'Contract declined',
      timestamp: new Date(),
    });
  }
}