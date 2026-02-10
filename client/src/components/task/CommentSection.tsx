import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Separator } from "@/components/ui/separator";
import type { Comment, User } from "@/types";

interface CommentSectionProps {
  comments: Comment[];
  users: User[];
  onAddComment: (authorId: string, text: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function CommentSection({
  comments,
  users,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [text, setText] = useState("");
  const [authorId, setAuthorId] = useState(users[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || !authorId) return;
    setIsSubmitting(true);
    try {
      await onAddComment(authorId, text.trim());
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">
        Comments ({comments.length})
      </h4>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar user={comment.author} size="sm" showTooltip={false} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{comment.author.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    onClick={() => onDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Comment as:</span>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="h-7 rounded-md border bg-transparent px-2 text-xs"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[60px] text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <Button
            size="icon"
            disabled={!text.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
