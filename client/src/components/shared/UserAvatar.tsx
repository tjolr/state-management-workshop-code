import type { User } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User;
  size?: "sm" | "md";
  className?: string;
  showTooltip?: boolean;
}

export function UserAvatar({
  user,
  size = "sm",
  className,
  showTooltip = true,
}: UserAvatarProps) {
  const sizeClasses = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  const avatar = (
    <Avatar className={cn(sizeClasses, className)}>
      <AvatarImage src={user.avatarUrl} alt={user.name} />
      <AvatarFallback className="text-[10px]">
        {user.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatar}</TooltipTrigger>
      <TooltipContent>
        <p>{user.name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
