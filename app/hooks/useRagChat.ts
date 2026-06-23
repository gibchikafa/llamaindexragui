"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ChatHandler, Message, TextPart } from "@llamaindex/chat-ui";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  sessionId?: string;
}

const STORAGE_KEY = "rag-conversations";

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface RagChatReturn extends ChatHandler {
  conversations: Conversation[];
  currentConvId: string | null;
  newChat: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

export function useRagChat(): RagChatReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [status, setStatus] = useState<ChatHandler["status"]>("ready");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConversations(loadConversations());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations, hydrated]);

  const messages = useMemo(
    () => conversations.find((c) => c.id === currentConvId)?.messages ?? [],
    [conversations, currentConvId]
  );

  const setMessages = useCallback(
    (msgs: Message[] | ((prev: Message[]) => Message[])) => {
      if (!currentConvId) return;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConvId
            ? {
                ...c,
                messages: typeof msgs === "function" ? msgs(c.messages) : msgs,
              }
            : c
        )
      );
    },
    [currentConvId]
  );

  const newChat = useCallback(() => setCurrentConvId(null), []);

  const selectConversation = useCallback((id: string) => setCurrentConvId(id), []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConvId === id) setCurrentConvId(null);
    },
    [currentConvId]
  );

  const sendMessage = useCallback(
    async (msg: Message) => {
      const prompt = msg.parts
        .filter((p): p is TextPart => p.type === "text")
        .map((p) => p.text)
        .join("");

      let convId = currentConvId;
      if (!convId) {
        convId = crypto.randomUUID();
        const title = prompt.length > 50 ? prompt.slice(0, 50) + "…" : prompt;
        setConversations((prev) => [
          { id: convId!, title, messages: [], updatedAt: Date.now() },
          ...prev,
        ]);
        setCurrentConvId(convId);
      }

      const existingSessionId = conversations.find(
        (c) => c.id === convId
      )?.sessionId;

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
            : c
        )
      );
      setStatus("submitted");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            ...(existingSessionId ? { session_id: existingSessionId } : {}),
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        type ApiSource = { title: string; doc_id: string; score: number };
        const sources: ApiSource[] = data.sources ?? [];

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [
            { type: "text", text: data.answer },
            ...(sources.length > 0
              ? [
                  {
                    type: "data-sources" as const,
                    data: {
                      nodes: sources.map((s) => ({
                        id: s.doc_id,
                        score: s.score,
                        text: s.title,
                        url: `https://arxiv.org/abs/${s.doc_id}`,
                        metadata: { title: s.title, doc_id: s.doc_id },
                      })),
                    },
                  },
                ]
              : []),
          ],
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, assistantMsg],
                  updatedAt: Date.now(),
                  ...(data.session_id ? { sessionId: data.session_id } : {}),
                }
              : c
          )
        );
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    },
    [currentConvId]
  );

  return {
    messages,
    status,
    sendMessage,
    setMessages,
    conversations,
    currentConvId,
    newChat,
    selectConversation,
    deleteConversation,
  };
}
