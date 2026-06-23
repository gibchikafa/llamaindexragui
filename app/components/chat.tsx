"use client";

import { useRef, useEffect } from "react";
import {
  ChatSection,
  ChatMessage,
  ChatInput,
  MarkdownPartUI,
  useChatUI,
  type MessagePart,
} from "@llamaindex/chat-ui";
import { ArrowUp, Loader2, ExternalLink } from "lucide-react";
import { useRagChat } from "@/app/hooks/useRagChat";
import { Sidebar } from "@/app/components/sidebar";

function ChatInputBar({ placeholder = "Ask anything" }: { placeholder?: string }) {
  return (
    <ChatInput className="p-0 bg-transparent">
      <ChatInput.Form className="relative flex items-end gap-2 rounded-3xl border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-zinc-300 focus-within:shadow-md transition-shadow">
        <ChatInput.Field
          className="flex-1 resize-none border-0 bg-transparent p-0 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 h-auto max-h-32 overflow-y-auto leading-relaxed"
          placeholder={placeholder}
        />
        <ChatInput.Submit className="static bottom-auto right-auto shrink-0 self-end h-8 w-8 rounded-full bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 transition-colors">
          <ArrowUp className="h-4 w-4" />
        </ChatInput.Submit>
      </ChatInput.Form>
    </ChatInput>
  );
}

type SourceNode = { id: string; score: number; text: string; url?: string };
type SourcesPart = { type: "data-sources"; data: { nodes: SourceNode[] } };

function SourcesDisplay({ parts }: { parts: MessagePart[] }) {
  const sourcesPart = parts.find((p) => p.type === "data-sources") as
    | SourcesPart
    | undefined;
  const nodes = sourcesPart?.data?.nodes ?? [];
  if (nodes.length === 0) return null;

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {nodes.map((node) => (
          <a
            key={node.id}
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex max-w-[260px] items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs transition-colors hover:border-zinc-300 hover:bg-zinc-100"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-700 group-hover:text-zinc-900">
                {node.text}
              </p>
              <p className="mt-0.5 text-zinc-400">
                {node.id} · {Math.round(node.score * 100)}% match
              </p>
            </div>
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-zinc-300 group-hover:text-zinc-500" />
          </a>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-20">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-800">
        Ready when you are.
      </h1>
      <div className="w-full max-w-2xl">
        <ChatInputBar placeholder="Ask anything" />
      </div>
    </div>
  );
}

function MessagesList() {
  const { messages, isLoading } = useChatUI();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
          {messages.map((message, i) => (
            <ChatMessage key={message.id} message={message} isLast={i === messages.length - 1}>
              {message.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-3xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-900">
                    {message.parts
                      .filter((p) => p.type === "text")
                      .map((p, j) => (
                        <span key={j}>{"text" in p ? p.text : ""}</span>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                    AI
                  </div>
                  <div className="flex-1 text-sm text-zinc-800 leading-relaxed">
                    <ChatMessage.Content className="p-0">
                      <MarkdownPartUI />
                    </ChatMessage.Content>
                    <SourcesDisplay parts={message.parts} />
                  </div>
                </div>
              )}
            </ChatMessage>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                AI
              </div>
              <Loader2 className="mt-1 h-4 w-4 animate-spin text-zinc-400" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="bg-white border-t border-zinc-100 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <ChatInputBar />
        </div>
      </div>
    </div>
  );
}

function MainArea() {
  const { messages } = useChatUI();
  return messages.length === 0 ? <EmptyState /> : <MessagesList />;
}

export function Chat() {
  const ragChat = useRagChat();

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        conversations={ragChat.conversations}
        currentConvId={ragChat.currentConvId}
        onNewChat={ragChat.newChat}
        onSelectConversation={ragChat.selectConversation}
        onDeleteConversation={ragChat.deleteConversation}
      />
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <ChatSection handler={ragChat} className="flex-1 h-full p-0 gap-0 min-h-0">
          <MainArea />
        </ChatSection>
      </div>
    </div>
  );
}
