export interface IChatApiService {
  sendMessageStream(
    chatId: string,
    messages: Array<{role: string, content: string}>
  ): AsyncGenerator<string>;
  
  abortRequest(): void;
}
