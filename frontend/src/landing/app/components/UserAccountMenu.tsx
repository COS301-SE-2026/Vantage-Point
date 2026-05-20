import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface UserAccountMenuProps {
  readonly onProfileClick?: () => void;
  readonly onLogout?: () => void;
  readonly initials?: string;
}

function ProfileAvatar({ initials }: Readonly<{ initials: string }>) {
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
}: Readonly<UserAccountMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#525252]"
          aria-label="Account menu"
        >
          <ProfileAvatar initials={initials} />
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
