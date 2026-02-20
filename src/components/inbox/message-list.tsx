"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InboxMessage } from "@/types/database";
import { MessageSquare, Mail, Star } from "lucide-react";

interface MessageListProps {
  messages: InboxMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

const MESSAGE_TYPE_ICONS: Record<string, React.ReactNode> = {
  comment: <MessageSquare className="w-4 h-4" />,
  dm: <Mail className="w-4 h-4" />,
  review: <Star className="w-4 h-4" />,
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-pink-500",
  tiktok: "bg-black",
  youtube: "bg-red-500",
  linkedin: "bg-blue-700",
  google_business: "bg-blue-400",
};

export function MessageList({
  messages,
  selectedId,
  onSelect,
  isLoading,
}: MessageListProps) {
  const [filter, setFilter] = useState<"all" | "comment" | "dm" | "review">("all");

  const filteredMessages = filter === "all"
    ? messages
    : messages.filter((msg) => msg.type === filter);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 dark:bg-slate-950 dark:border-slate-800">
      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              All {messages.length > 0 && `(${messages.length})`}
            </TabsTrigger>
            <TabsTrigger value="comment" className="text-xs">
              Comments
            </TabsTrigger>
            <TabsTrigger value="dm" className="text-xs">
              DMs
            </TabsTrigger>
            <TabsTrigger value="review" className="text-xs">
              Reviews
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 p-4 text-center text-sm">
            No messages in this filter
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => onSelect(message.id)}
                className={cn(
                  "w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900",
                  selectedId === message.id
                    ? "bg-blue-50 dark:bg-slate-800"
                    : ""
                )}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={message.sender_avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-50 truncate">
                        {message.sender_name}
                      </p>
                      <time className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {formatRelativeTime(message.received_at)}
                      </time>
                    </div>

                    {/* Snippet */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 truncate line-clamp-1">
                      {message.content}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-white text-xs py-0.5 px-2",
                          PLATFORM_COLORS[message.platform] || "bg-slate-500"
                        )}
                      >
                        {message.platform}
                      </Badge>
                      {MESSAGE_TYPE_ICONS[message.type] && (
                        <span className="text-slate-400 dark:text-slate-600">
                          {MESSAGE_TYPE_ICONS[message.type]}
                        </span>
                      )}
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
