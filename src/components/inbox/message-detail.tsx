"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { InboxMessage } from "@/types/database";
import { Send, Check, CheckCheck, MessageSquare, Mail, Star } from "lucide-react";

interface MessageDetailProps {
  message: InboxMessage | null;
  onReply?: (content: string) => Promise<void>;
  onMarkRead?: (isRead: boolean) => Promise<void>;
  onMarkResolved?: (isResolved: boolean) => Promise<void>;
  isReplying?: boolean;
}

const MESSAGE_TYPE_LABELS: Record<string, string> = {
  comment: "Comment",
  dm: "Direct Message",
  review: "Review",
};

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

export function MessageDetail({
  message,
  onReply,
  onMarkRead,
  onMarkResolved,
  isReplying = false,
}: MessageDetailProps) {
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [replyContent]);

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(replyContent);
      setReplyContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!message) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-slate-950">
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
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={message.sender_avatar || undefined} />
              <AvatarFallback className="text-sm">
                {message.sender_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                {message.sender_name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {formatDate(message.received_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="secondary"
              className={cn(
                "text-white text-xs py-1 px-2",
                PLATFORM_COLORS[message.platform] || "bg-slate-500"
              )}
            >
              {message.platform}
            </Badge>
            <Badge variant="secondary" className="text-xs py-1 px-2">
              {MESSAGE_TYPE_ICONS[message.type]}
              <span className="ml-1">{MESSAGE_TYPE_LABELS[message.type]}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {message.replied_at && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCheck className="w-4 h-4" />
              Replied {formatDate(message.replied_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex gap-2 flex-shrink-0 flex-wrap">
        <Button
          variant={message.is_read ? "outline" : "default"}
          size="sm"
          onClick={() => onMarkRead?.(!message.is_read)}
          className="text-xs"
        >
          <Check className="w-4 h-4 mr-1" />
          {message.is_read ? "Mark Unread" : "Mark Read"}
        </Button>

        <Button
          variant={message.is_resolved ? "default" : "outline"}
          size="sm"
          onClick={() => onMarkResolved?.(!message.is_resolved)}
          className="text-xs"
        >
          {message.is_resolved ? "Reopen" : "Resolve"}
        </Button>
      </div>

      {/* Reply Section */}
      {!message.replied_at && (
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex-shrink-0 bg-slate-50 dark:bg-slate-900">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Reply
          </label>
          <Textarea
            ref={textareaRef}
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            disabled={isSubmitting || isReplying}
            className="resize-none mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || isSubmitting || isReplying}
              size="sm"
              className="text-xs"
            >
              <Send className="w-4 h-4 mr-1" />
              Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
