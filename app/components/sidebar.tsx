"use client";

import { useState } from "react";
import { MessageSquare, Plus, Search, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";
import type { Conversation } from "@/app/hooks/useRagChat";

interface SidebarProps {
  conversations: Conversation[];
  currentConvId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  currentConvId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (collapsed) {
    return (
      <div className="flex h-screen w-12 shrink-0 flex-col items-center border-r border-zinc-200 bg-zinc-50 py-3">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
          title="Expand sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onNewChat}
          className="mt-2 rounded-lg p-2 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
          title="New chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-700" />
          <span className="text-sm font-semibold text-zinc-800">RAG Agent</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      {/* Search (placeholder) */}
      <div className="px-2 pt-1">
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-200">
          <Search className="h-4 w-4" />
          Search chats
        </button>
      </div>

      {/* Conversation list */}
      <div className="mt-4 flex-1 overflow-y-auto px-2">
        {conversations.length > 0 && (
          <>
            <p className="mb-1 px-3 text-xs font-medium text-zinc-400">Recents</p>
            <ul className="space-y-0.5">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <div
                    className={`group relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm ${
                      conv.id === currentConvId
                        ? "bg-zinc-200 text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-200"
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                    onMouseEnter={() => setHoveredId(conv.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <span className="flex-1 truncate pr-6">{conv.title}</span>
                    {hoveredId === conv.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="absolute right-2 rounded p-0.5 text-zinc-400 hover:bg-zinc-300 hover:text-zinc-700"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
