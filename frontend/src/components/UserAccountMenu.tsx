import { LogOut, Pencil, User } from "lucide-react";
import { resolveAvatarUrl } from "../lib/avatarUrl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

/** 48px header avatar, or the 88px ProfileAvatar from Figma 13:1166. */
export type AccountAvatarSize = 48 | 88;

interface UserAccountMenuProps {
  readonly onProfileClick?: () => void;
  readonly onEditProfileClick?: () => void;
  readonly onLogout?: () => void;
  readonly initials?: string;
  readonly avatarUrl?: string | null;
  readonly size?: AccountAvatarSize;
}

const LARGE_INITIALS_CLASS =
  "font-['Beaufort_for_LOL',serif] text-[24px] font-medium leading-[21px] tracking-[-0.28px] text-[#1e1e1e] device-dark:text-white";
const SMALL_INITIALS_CLASS =
  "font-['Sora',sans-serif] text-[14px] font-normal leading-normal tracking-[-0.28px] text-[#0a0a0a] device-dark:text-white";

function ProfileAvatar({
  initials,
  avatarUrl,
  size,
}: Readonly<{
  initials: string;
  avatarUrl?: string | null;
  size: AccountAvatarSize;
}>) {
  const src = resolveAvatarUrl(avatarUrl ?? undefined);
  const isLarge = size === 88;
  const initialsClass = isLarge ? LARGE_INITIALS_CLASS : SMALL_INITIALS_CLASS;

  if (src) {
    return (
      <Avatar style={{ width: size, height: size }}>
        <AvatarImage src={src} alt="" className="object-cover" />
        <AvatarFallback
          className={`bg-[#dddddd] device-dark:bg-[#3a3939] ${initialsClass}`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      data-name="ProfileAvatar"
    >
      {isLarge ? (
        /**
         * Figma 13:1167 — path lifted verbatim from the exported avatar-circle.svg
         * (same 88 viewBox, same geometry) so the fill can follow the device theme;
         * an <img> can't be recoloured, and dark needs #3a3939 (Figma 13:1202).
         */
        <svg
          className="absolute block inset-0 size-full text-[#dddddd] device-dark:text-[#3a3939]"
          fill="none"
          viewBox="0 0 88 88"
          aria-hidden
        >
          <path
            d="M44 88C68.3005 88 88 68.3005 88 44C88 19.6995 68.3005 0 44 0C19.6995 0 0 19.6995 0 44C0 68.3005 19.6995 88 44 88Z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg
          className="absolute block inset-0 size-full text-[#D9D9D9] device-dark:text-[#3a3939]"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 48 48"
          aria-hidden
        >
          <circle cx="24" cy="24" fill="currentColor" r="24" />
        </svg>
      )}
      <span
        className={`absolute inset-0 flex items-center justify-center ${initialsClass}`}
      >
        {initials}
      </span>
    </div>
  );
}

export default function UserAccountMenu({
  onProfileClick,
  onEditProfileClick,
  onLogout,
  initials = "UN",
  avatarUrl = null,
  size = 48,
}: Readonly<UserAccountMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#525252]"
          aria-label="Account menu"
        >
          <ProfileAvatar
            initials={initials}
            avatarUrl={avatarUrl}
            size={size}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="min-w-[10rem]">
        <DropdownMenuItem
          onSelect={() => onProfileClick?.()}
          className="font-['Inter',sans-serif] cursor-pointer"
        >
          <User className="size-4" aria-hidden />
          Profile
        </DropdownMenuItem>
        {onEditProfileClick ? (
          <DropdownMenuItem
            onSelect={() => onEditProfileClick()}
            className="font-['Inter',sans-serif] cursor-pointer"
          >
            <Pencil className="size-4" aria-hidden />
            Edit profile
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onLogout?.()}
          className="font-['Inter',sans-serif] cursor-pointer"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
