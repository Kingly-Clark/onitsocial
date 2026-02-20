"use client";

import { useEffect, useState, useCallback } from "react";
import { useBrandStore } from "@/store/brand-store";
import { MessageList } from "@/components/inbox/message-list";
import { MessageDetail } from "@/components/inbox/message-detail";
import { InboxToolbar } from "@/components/inbox/inbox-toolbar";
import { Mail } from "lucide-react";
import type { InboxMessage, Platform } from "@/types/database";

export default function InboxPage() {
  const { activeBrandId } = useBrandStore();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlatformFilter, setActivePlatformFilter] = useState<Platform | null>(null);
  const [activeReadFilter, setActiveReadFilter] = useState<"all" | "read" | "unread">("all");
  const [activeResolvedFilter, setActiveResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all");

  const selectedMessage = messages.find((m) => m.id === selectedMessageId) || null;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!activeBrandId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        brand_id: activeBrandId,
      });

      const response = await fetch(`/api/inbox?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error("Failed to fetch messages");
        return;
      }

      const result = await response.json();
      setMessages(result.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeBrandId]);

  // Sync messages
  const handleSync = useCallback(async () => {
    if (!activeBrandId) return;

    setIsSyncing(true);
    try {
      const response = await fetch("/api/inbox/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id: activeBrandId }),
      });

      if (response.ok) {
        // Refresh the message list
        await fetchMessages();
      }
    } catch (error) {
      console.error("Error syncing messages:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [activeBrandId, fetchMessages]);

  // Handle message selection - mark as read
  const handleSelectMessage = useCallback(
    async (messageId: string) => {
      setSelectedMessageId(messageId);

      const message = messages.find((m) => m.id === messageId);
      if (message && !message.is_read) {
        try {
          await fetch(`/api/inbox/${messageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_read: true }),
          });

          // Update local state
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, is_read: true } : m
            )
          );
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    },
    [messages]
  );

  // Handle reply
  const handleReply = useCallback(
    async (content: string) => {
      if (!selectedMessageId) return;

      setIsReplying(true);
      try {
        const response = await fetch(`/api/inbox/${selectedMessageId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const result = await response.json();

          // Update local state
          setMessages((prev) =>
            prev.map((m) =>
              m.id === selectedMessageId
                ? { ...m, replied_at: result.data.replied_at }
                : m
            )
          );

          // Update selected message
          if (selectedMessage) {
            setSelectedMessageId(selectedMessageId);
          }
        }
      } catch (error) {
        console.error("Error sending reply:", error);
      } finally {
        setIsReplying(false);
      }
    },
    [selectedMessageId, selectedMessage]
  );

  // Handle mark read
  const handleMarkRead = useCallback(
    async (isRead: boolean) => {
      if (!selectedMessageId) return;

      try {
        const response = await fetch(`/api/inbox/${selectedMessageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: isRead }),
        });

        if (response.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === selectedMessageId ? { ...m, is_read: isRead } : m
            )
          );
        }
      } catch (error) {
        console.error("Error updating message:", error);
      }
    },
    [selectedMessageId]
  );

  // Handle mark resolved
  const handleMarkResolved = useCallback(
    async (isResolved: boolean) => {
      if (!selectedMessageId) return;

      try {
        const response = await fetch(`/api/inbox/${selectedMessageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_resolved: isResolved }),
        });

        if (response.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === selectedMessageId ? { ...m, is_resolved: isResolved } : m
            )
          );
        }
      } catch (error) {
        console.error("Error updating message:", error);
      }
    },
    [selectedMessageId]
  );

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !message.content.toLowerCase().includes(query) &&
        !message.sender_name.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Platform filter
    if (activePlatformFilter && message.platform !== activePlatformFilter) {
      return false;
    }

    // Read status filter
    if (activeReadFilter === "read" && !message.is_read) return false;
    if (activeReadFilter === "unread" && message.is_read) return false;

    // Resolved status filter
    if (activeResolvedFilter === "resolved" && !message.is_resolved) return false;
    if (activeResolvedFilter === "unresolved" && message.is_resolved) return false;

    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Load messages on component mount or brand change
  useEffect(() => {
    fetchMessages();
  }, [activeBrandId, fetchMessages]);

  // If no brand is selected, show empty state
  if (!activeBrandId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Mail className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            Select a brand to view messages
          </p>
        </div>
      </div>
    );
  }

  // If no messages and not loading, show empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col h-full">
        <InboxToolbar
          onSearch={setSearchQuery}
          onFilterPlatform={setActivePlatformFilter}
          onFilterReadStatus={setActiveReadFilter}
          onFilterResolved={setActiveResolvedFilter}
          onSync={handleSync}
          unreadCount={unreadCount}
          isSyncing={isSyncing}
          searchQuery={searchQuery}
          activePlatformFilter={activePlatformFilter}
          activeReadFilter={activeReadFilter}
          activeResolvedFilter={activeResolvedFilter}
        />

        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No messages yet
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Connect your social accounts to start receiving messages
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <InboxToolbar
        onSearch={setSearchQuery}
        onFilterPlatform={setActivePlatformFilter}
        onFilterReadStatus={setActiveReadFilter}
        onFilterResolved={setActiveResolvedFilter}
        onSync={handleSync}
        unreadCount={unreadCount}
        isSyncing={isSyncing}
        searchQuery={searchQuery}
        activePlatformFilter={activePlatformFilter}
        activeReadFilter={activeReadFilter}
        activeResolvedFilter={activeResolvedFilter}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Message List - 1/3 width on desktop, full on mobile when no message selected */}
        <div className="hidden md:flex md:w-1/3 h-full flex-col">
          <MessageList
            messages={filteredMessages}
            selectedId={selectedMessageId}
            onSelect={handleSelectMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Message Detail - 2/3 width on desktop, full on mobile when message selected */}
        <div className="w-full md:w-2/3 h-full">
          {selectedMessageId ? (
            <MessageDetail
              message={selectedMessage}
              onReply={handleReply}
              onMarkRead={handleMarkRead}
              onMarkResolved={handleMarkResolved}
              isReplying={isReplying}
            />
          ) : (
            <div className="hidden md:flex items-center justify-center h-full bg-white dark:bg-slate-950">
              <div className="text-center">
                <Mail className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No message selected
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                  Select a message from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile message list toggle */}
        <div className="md:hidden w-full h-full">
          {selectedMessageId ? (
            <MessageDetail
              message={selectedMessage}
              onReply={handleReply}
              onMarkRead={handleMarkRead}
              onMarkResolved={handleMarkResolved}
              isReplying={isReplying}
            />
          ) : (
            <MessageList
              messages={filteredMessages}
              selectedId={selectedMessageId}
              onSelect={handleSelectMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
