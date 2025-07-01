import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";

import { prompt } from "./prompt/index.js";
import type { PromptPayload } from "./prompt/types.js";
import { conversationMemory } from "./prompt/conversation-memory.js";
import { PORT, NODE_ENV } from "./constants.js";
import path from "path";
import { fileURLToPath } from "url";
import { startServer } from "agent-server-definition";

// const app = express();
const port = PORT;

// Security middleware
// app.use(helmet());

const allowedOrigins = [
  'http://localhost:5050',
  'http://127.0.0.1:5050',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://nerdalert.app',
  'https://www.nerdalert.app',
  // Regex to match Vercel deployment URLs
  /https:\/\/nerdalert-project-.*-acidmans-projects\.vercel\.app$/,
  // Regex to match ngrok free URLs
  /https?:\/\/[a-zA-Z0-9-]+\.ngrok-free\.app$/,
];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
// app.use(express.json({ limit: "50mb" }));

type ExtendedPromptPayload = PromptPayload & {
  ping?: boolean;
  stream?: boolean;
};

interface StreamResponse extends Response {
  flush?: () => void;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, "../../client/dist");

const handlePrompt = async (req: Request, res: StreamResponse) => {
  const payload: ExtendedPromptPayload = req.body;
  try {
    if (!!payload.ping) {
      res.send("online");
    } else {
      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream the response
      try {
        console.log("Starting streaming response");
        const result = await prompt(payload);

        if (result && typeof result === "object" && "getReader" in result) {
          console.log("Got readable stream, starting to read");
          const reader = (result as ReadableStream).getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log("Stream complete");
                res.write("data: [DONE]\n\n");
                break;
              }
              // Ensure each chunk is a complete 'data: ...' line
              const chunkStr = value instanceof Buffer ? value.toString() : new TextDecoder().decode(value);
              const lines = chunkStr.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  // If the line already starts with 'data: ', write as-is
                  if (line.startsWith('data: ')) {
                    res.write(line.endsWith('\n') ? line : line + '\n');
                  } else {
                    // Otherwise, wrap it as a data line
                    res.write(`data: ${line}\n\n`);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Stream reading error:", error);
            res.write(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            );
          } finally {
            reader.releaseLock();
            res.end();
          }
        } else {
          console.log("Got non-stream response:", result);
          // For non-stream responses in streaming mode, format as SSE
          res.write(
            `data: ${JSON.stringify({
              type: "complete",
              content: result,
            })}\n\n`
          );
          res.write("data: [DONE]\n\n");
          res.end();
        }
      } catch (error) {
        console.error("Stream processing error:", error);
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          })}\n\n`
        );
        res.end();
      }
    }
  } catch (error) {
    console.log("prompt: error", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Non-streaming handler for frontend compatibility
const handlePromptSync = async (req: Request, res: Response) => {
  const payload: ExtendedPromptPayload = req.body;
  try {
    if (!!payload.ping) {
      res.json({ status: "online" });
    } else {
      console.log("Starting non-streaming response");
      const result = await prompt(payload);

      if (result && typeof result === "object" && "getReader" in result) {
        // Convert stream to string for non-streaming response
        const reader = (result as ReadableStream).getReader();
        let fullResponse = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Convert the chunk to string and extract content
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                    fullResponse += parsed.choices[0].delta.content;
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        
        res.json({ text: fullResponse });
      } else {
        // Direct response
        res.json({ text: result });
      }
    }
  } catch (error) {
    console.log("prompt-sync: error", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

const appServerConfig = {
  enableStaticServing: true,
  staticDir: staticDir,
  staticUrlPath: "/",
  is404Redirect: false,
  esBuildPlugins: [
    {
      name: "inject-env",
      setup(build: any) {
        build.onLoad({ filter: /\.(js|ts)$/ }, async (args: any) => {
          const fs = await import("fs/promises");
          const contents = await fs.readFile(args.path, "utf8");

          const injected = contents.replace(/process\.env\.(\w+)/g, (_, name) =>
            JSON.stringify(process.env[name] || "")
          );

          return {
            contents: injected,
            loader: "ts",
          };
        });
      },
    },
  ],
  extendedRoutes: [
    {
      path: "/health",
      method: "GET",
      handler: (req: Request, res: Response) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
      }
    },
    {
      path: "/chat",
      method: "POST",
      handler: handlePrompt,
    },
    {
      path: "/prompt-sync",
      method: "POST",
      handler: handlePromptSync,
    },
    {
      path: "/start",
      method: "POST",
      handler: (req: Request, res: StreamResponse) => {
        // Use the same handler as /prompt, but with an empty message payload
        // to trigger the agent's introduction.
        req.body = { messages: [] };
        handlePrompt(req, res);
      },
    },
    {
      path: "/memory/:sessionId",
      method: "GET",
      handler: (req: Request, res: Response) => {
        const { sessionId } = req.params;
        const memory = conversationMemory.getMemory(sessionId);
        if (memory) {
          res.json({
            sessionId,
            discussedTopics: Array.from(memory.discussedTopics),
            recentMessages: memory.recentMessages,
            lastUpdate: memory.lastUpdate
          });
        } else {
          res.status(404).json({ error: "Session not found" });
        }
      },
    },
    {
      path: "/memory/:sessionId",
      method: "DELETE",
      handler: (req: Request, res: Response) => {
        const { sessionId } = req.params;
        conversationMemory.clearSession(sessionId);
        res.json({ message: "Session memory cleared" });
      },
    },
    {
      path: "/memory",
      method: "GET",
      handler: (req: Request, res: Response) => {
        // Return a list of active sessions (for debugging)
        res.json({ message: "Memory management endpoints available" });
      },
    },
  ],
};

const agentServerConfig = {
  enableStaticServing: false,
  staticDir: staticDir,
  staticUrlPath: "/",
  is404Redirect: false,
  extendedRoutes: [
    {
      path: "/prompt",
      method: "POST",
      handler: (req: any, res: any) => {
        const iframe =
          '<iframe width="560" height="315" src="https://www.youtube.com/embed/JCPy_Kkq6jw?si=mrcX05MklsYDdiV7" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
        res.json({
          id: "chatcmpl-123123123",
          object: "chat.completion",
          created: 1700000000,
          model: "local-model",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                reasoning_content: null,
                content: iframe,
                tool_calls: [],
              },
              logprobs: null,
              finish_reason: "stop",
              stop_reason: null,
            },
          ],
          usage: {
            prompt_tokens: 10,
            total_tokens: 30,
            completion_tokens: 20,
            prompt_tokens_details: null,
          },
          prompt_logprobs: null,
        });
      },
    },
    {
      path: "/processing-url",
      method: "GET",
      handler: (req: any, res: any) => {
        res.json({
          url: "http://localhost:8080",
          status: "ready",
        });
      },
    },
  ],
};

startServer(8080, (() => {}) as any, appServerConfig as any);
startServer(Number(port), (() => {}) as any, agentServerConfig as any);

// Global error handler
// app.use((err: Error, req: Request, res: Response, next: Function) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({
//     error: err.message,
//     stack: NODE_ENV === "production" ? undefined : err.stack,
//   });
// });

// Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
//   console.log(`Environment: ${NODE_ENV || "development"}`);
// });
