import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { chatHistoryQueryKey } from "@/lib/query-keys";

const CHATBOT_BASE_URL =
  typeof window !== "undefined"
    ? window.CHATBOT_BASE_URL || window.location.origin
    : "";

/** Fetch chat history from API */
async function fetchHistory(): Promise<ChatMessage[]> {
  const response = await fetch(`${CHATBOT_BASE_URL}/api/history`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chat history");
  }
  const data = await response.json();
  return data.messages || [];
}

/** DELETE server session and expire cookie */
async function clearHistoryOnServer(): Promise<void> {
  const response = await fetch(`${CHATBOT_BASE_URL}/api/history`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to clear chat on server");
  }
}

/** Send a message to the chat API and stream the response */
async function sendMessage(
  message: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${CHATBOT_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    credentials: "include",
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to send message");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunks = decoder.decode(value, { stream: true });
    const lines = chunks.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.response) {
          fullResponse += parsed.response;
          onChunk(parsed.response);
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
      } catch {
        // Skip invalid JSON lines in stream
      }
    }
  }

  return fullResponse;
}

/**
 * React hook for managing chat functionality
 * Provides chat history, sending messages, and server-synced clear
 */
export function useChat() {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: chatHistoryQueryKey,
    queryFn: fetchHistory,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchOnMount: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsStreaming(true);
      setStreamingMessage("");

      const timestamp = Date.now();
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp,
      };

      queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, (old) => {
        const existing = old || [];
        const lastMsg = existing[existing.length - 1];
        if (lastMsg?.role === "user" && lastMsg?.content === message) {
          return existing;
        }
        return [...existing, userMessage];
      });

      let fullResponse = "";

      try {
        fullResponse = await sendMessage(message, (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        });

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: fullResponse,
          timestamp: timestamp + 1,
        };

        queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, (old) => {
          if (!old) return [userMessage, assistantMessage];

          const userMsgIndex = old.findIndex(
            (msg) => msg.role === "user" && msg.timestamp === timestamp
          );

          if (userMsgIndex >= 0) {
            const updated = old.slice(0, userMsgIndex + 1);
            return [...updated, assistantMessage];
          }

          return [...old, userMessage, assistantMessage];
        });

        return assistantMessage;
      } catch (error) {
        queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, (old) => {
          if (!old) return old;
          return old.filter((msg) => msg.timestamp !== userMessage.timestamp);
        });
        throw error;
      } finally {
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to send message", error.message);
      setIsStreaming(false);
      setStreamingMessage("");
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: clearHistoryOnServer,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: chatHistoryQueryKey });
      const previousMessages =
        queryClient.getQueryData<ChatMessage[]>(chatHistoryQueryKey) ?? [];
      queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, []);
      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, []);
      toast.success("Chat cleared");
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(chatHistoryQueryKey, context.previousMessages);
      }
      toast.error("Failed to clear chat", error.message);
    },
  });

  const addMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(chatHistoryQueryKey, (old) => {
        const existing = old || [];
        return [...existing, message];
      });
    },
    [queryClient]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending || isStreaming,
    streamingMessage,
    clearChat: clearChatMutation.mutate,
    isClearing: clearChatMutation.isPending,
    addMessage,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: chatHistoryQueryKey }),
  };
}
