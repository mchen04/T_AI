import { IChatApiService } from "./interfaces/IChatApiService";

export interface ChatApiConfig {
  apiUrl: string;
  apiKey: string;
  model?: string;
  temperature?: number;
}

export class ChatApiService implements IChatApiService {
  private config: ChatApiConfig;
  private abortController: AbortController | null = null;

  constructor(config: ChatApiConfig) {
    this.config = {
      model: "deepseek-chat",
      temperature: 0.7,
      ...config
    };
  }

  async *sendMessageStream(
    chatId: string,
    messages: Array<{role: string, content: string}>
  ): AsyncGenerator<string> {
    this.abortController = new AbortController();
    
    try {
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: this.config.temperature,
          stream: true
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (error) {
              console.error("Error parsing stream data:", error);
            }
          }
        }
      }
    } finally {
      this.abortController = null;
    }
  }

  abortRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
