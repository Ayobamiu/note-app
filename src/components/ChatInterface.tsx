import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Plus,
  ChevronDown,
  Edit2,
  Trash2,
  History,
} from "lucide-react";
import clsx from "clsx";

export const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<
    number | null
  >(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  // Close conversation list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        conversationListRef.current &&
        !conversationListRef.current.contains(event.target as Node)
      ) {
        setShowConversationList(false);
      }
    };

    if (showConversationList) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showConversationList]);

  const loadConversations = async () => {
    try {
      const convos = await window.electronAPI.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const msgs = await window.electronAPI.getMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setQuery("");
    setShowConversationList(false);
  };

  const handleSelectConversation = async (id: number) => {
    setCurrentConversationId(id);
    setShowConversationList(false);
  };

  const handleStartEditTitle = (
    e: React.MouseEvent,
    conversation: Conversation
  ) => {
    e.stopPropagation();
    setEditingConversationId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveTitle = async (id: number) => {
    if (editingTitle.trim()) {
      await window.electronAPI.updateConversationTitle(id, editingTitle.trim());
      await loadConversations();
    }
    setEditingConversationId(null);
    setEditingTitle("");
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      await window.electronAPI.deleteConversation(id);
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      await loadConversations();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query;
    setQuery("");

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: Date.now(),
      conversation_id: currentConversationId || 0,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await window.electronAPI.askAI(
        userMessage,
        currentConversationId
      );

      // Update current conversation ID if a new one was created
      if (response.conversationId) {
        setCurrentConversationId(response.conversationId);
        await loadConversations();
      }

      // Reload messages to get the saved ones from database
      if (response.conversationId) {
        await loadMessages(response.conversationId);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now(),
        conversation_id: currentConversationId || 0,
        role: "ai",
        content: "Sorry, I couldn't reach the brain. Try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden ring-1 ring-black/5">
          {/* Header */}
          <div className="p-4 border-b border-zinc-200/50 bg-white/50 flex items-center justify-between relative">
            <div className="flex items-center gap-2 text-zinc-800 flex-1 min-w-0">
              <div
                className="flex-1 min-w-0 relative"
                ref={conversationListRef}
              >
                <button
                  onClick={() => setShowConversationList(!showConversationList)}
                  className="flex items-center gap-2 text-sm font-semibold hover:text-zinc-600 transition-colors truncate"
                >
                  <span className="truncate">
                    {currentConversation
                      ? currentConversation.title
                      : "New Conversation"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={clsx(
                      "shrink-0 transition-transform",
                      showConversationList && "rotate-180"
                    )}
                  />
                </button>

                {showConversationList && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50">
                    <div className="p-2">
                      <button
                        onClick={handleNewConversation}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors mb-2"
                      >
                        <Plus size={14} />
                        <span>New Conversation</span>
                      </button>
                      <div className="border-t border-zinc-200 my-2" />
                      {conversations.length === 0 ? (
                        <div className="px-3 py-4 text-center text-zinc-400 text-sm">
                          No conversations yet
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={clsx(
                              "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors mb-1",
                              currentConversationId === conv.id
                                ? "bg-zinc-100"
                                : "hover:bg-zinc-50"
                            )}
                          >
                            {editingConversationId === conv.id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onBlur={() => handleSaveTitle(conv.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveTitle(conv.id);
                                  } else if (e.key === "Escape") {
                                    setEditingConversationId(null);
                                    setEditingTitle("");
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm bg-white border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <History
                                    size={12}
                                    className="text-zinc-400 shrink-0"
                                  />
                                  <span className="text-sm text-zinc-700 truncate">
                                    {conv.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={(e) =>
                                      handleStartEditTitle(e, conv)
                                    }
                                    className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                                    title="Rename"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteConversation(e, conv.id)
                                    }
                                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-zinc-500"
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-500 shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-center p-4">
                <p className="text-sm">Ask me anything about your notes...</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={clsx(
                  "max-w-[85%] p-3 text-sm rounded-2xl shadow-sm",
                  msg.role === "user"
                    ? "bg-zinc-900 text-white self-end ml-auto rounded-br-none"
                    : "bg-white text-zinc-800 self-start mr-auto border border-zinc-100 rounded-bl-none"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-zinc-100 text-zinc-500 self-start mr-auto p-3 rounded-2xl rounded-bl-none text-sm flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white/50 border-t border-zinc-200/50"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a question..."
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 p-1.5 bg-zinc-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen
            ? "bg-zinc-200 text-zinc-600 rotate-90"
            : "bg-zinc-900 text-white hover:bg-zinc-800"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};
