import { apiRequest } from "./queryClient";

// TypeScript declarations for Vite env
declare global {
  interface ImportMetaEnv {
    VITE_NERDALERT_API_URL?: string;
    VITE_WEBBASE_URL?: string;
    [key: string]: any;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const getApiBase = () => {
  // For production, use the Cloudflare setup
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NERDALERT_API_URL) {
    return import.meta.env.VITE_NERDALERT_API_URL;
  }
  
  // Check for VITE_WEBBASE_URL (Vite environment variable)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WEBBASE_URL && import.meta.env.VITE_WEBBASE_URL !== "/") {
    return import.meta.env.VITE_WEBBASE_URL;
  }
  
  // Development fallback - use port 80 where the Express server runs
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:80';
  }
  
  // Production fallback - your Cloudflare setup
  return 'https://nerdalert.app';
};

const API_BASE = getApiBase();

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface SendMessageRequest {
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  response: string;
}

// Function to clean message content by removing internal thinking tags and tool calls
// Only clean complete tags, don't modify partial chunks
const cleanMessageContent = (content: string): string => {
  // Don't process chunks that might be incomplete - just return as-is
  // We'll clean the final content later when it's complete
  return content;
};

export async function sendMessage(
  request: SendMessageRequest,
  onStreamChunk?: (chunk: string) => void,
  onThinking?: (isThinking: boolean) => void
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let buffer = "";
  let isThinkingActive = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            // Stream is complete, stop thinking state
            if (isThinkingActive && onThinking) {
              onThinking(false);
              isThinkingActive = false;
            }
            return { response: result };
          }
          
          try {
            const parsed = JSON.parse(data);
            
            // Handle different chunk types
            if (parsed.type === "error") {
              throw new Error(parsed.error);
            }
            
            // Check for tool calls - if present, enter thinking mode
            if (parsed.choices?.[0]?.delta?.tool_calls) {
              if (!isThinkingActive && onThinking) {
                onThinking(true);
                isThinkingActive = true;
              }
              // Don't add tool calls to the result
              continue;
            }
            
            // Check for content
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && typeof content === 'string') {
              // If we were thinking and now have content, stop thinking
              if (isThinkingActive && onThinking) {
                onThinking(false);
                isThinkingActive = false;
              }
              
              // Pass chunks through as-is to preserve all formatting and spaces
              result += content;
              if (onStreamChunk) onStreamChunk(content);
            }
            
            // Handle finish reason
            if (parsed.choices?.[0]?.finish_reason) {
              if (isThinkingActive && onThinking) {
                onThinking(false);
                isThinkingActive = false;
              }
            }
            
          } catch (e) {
            // Ignore parse errors for malformed chunks
            console.warn("Failed to parse SSE chunk:", data);
          }
        }
      }
    }
  } finally {
    // Ensure thinking state is cleared
    if (isThinkingActive && onThinking) {
      onThinking(false);
    }
  }
  
  return { response: result };
}

export async function getMessages() {
  const response = await apiRequest("GET", "/memory");
  return response.json();
}

export async function clearMessages() {
  const response = await apiRequest("DELETE", "/memory");
  return response.json();
}
