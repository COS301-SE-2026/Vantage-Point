import { LogOut, User } from "lucide-react";
import { resolveAvatarUrl } from "../lib/avatarUrl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAccountMenuProps {
  readonly onProfileClick?: () => void;
  readonly onLogout?: () => void;
  readonly initials?: string;
  readonly avatarUrl?: string | null;
}

function ProfileAvatar({
  initials,
  avatarUrl,
}: Readonly<{ initials: string; avatarUrl?: string | null }>) {
  const src = resolveAvatarUrl(avatarUrl ?? undefined);

  if (src) {
    return (
      <Avatar className="size-[48px]">
        <AvatarImage src={src} alt="" className="object-cover" />
        <AvatarFallback className="bg-[#d9d9d9] font-['Sora:Regular',sans-serif] text-[14px] text-[#0a0a0a]">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="relative size-[48px] shrink-0">
      <svg
        className="absolute block inset-0 size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 48 48"
        aria-hidden
      >
        <circle cx="24" cy="24" fill="#D9D9D9" r="24" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-['Sora:Regular',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a]">
        {initials}
      </span>
    </div>
  );
}

export default function UserAccountMenu({
  onProfileClick,
  onLogout,
  initials = "UN",
  avatarUrl = null,
}: Readonly<UserAccountMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#525252]"
          aria-label="Account menu"
        >
          <ProfileAvatar initials={initials} avatarUrl={avatarUrl} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
        <DropdownMenuItem
          onSelect={() => onProfileClick?.()}
          className="font-['Inter:Regular',sans-serif] cursor-pointer"
        >
          <User className="size-4" aria-hidden />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onLogout?.()}
          className="font-['Inter:Regular',sans-serif] cursor-pointer"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
