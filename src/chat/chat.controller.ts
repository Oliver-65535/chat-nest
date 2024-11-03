import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  createChat(@Body() data: { chatId: string }) {
    return this.chatService.createChat(data.chatId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiResponse({ status: 200, description: 'Returns chat details' })
  getChat(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }
}