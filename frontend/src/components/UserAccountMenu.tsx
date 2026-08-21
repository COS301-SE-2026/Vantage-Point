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

/** Header avatar, or the large one the profile header used to show. */
export type AccountAvatarSize = 36 | 48 | 88;

interface UserAccountMenuProps {
  readonly onProfileClick?: () => void;
  readonly onEditProfileClick?: () => void;
  readonly onLogout?: () => void;
  readonly initials?: string;
  readonly avatarUrl?: string | null;
  readonly size?: AccountAvatarSize;
}

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
  const initialsClass =
    size >= 88
      ? "text-[24px] font-medium"
      : size >= 48
        ? "text-[15px] font-medium"
        : "text-[12px] font-medium";

  if (src) {
    return (
      <Avatar style={{ width: size, height: size }}>
        <AvatarImage src={src} alt="" className="object-cover" />
        <AvatarFallback className={`bg-vp-raised text-vp-ink ${initialsClass}`}>
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
      <span className="absolute inset-0 rounded-full border border-vp-line-strong bg-vp-raised" />
      <span
        className={`absolute inset-0 flex items-center justify-center tracking-[0.02em] text-vp-ink ${initialsClass}`}
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
  size = 36,
}: Readonly<UserAccountMenuProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-full border-0 bg-transparent p-0 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vp-gold"
          aria-label="Account menu"
        >
          <ProfileAvatar
            initials={initials}
            avatarUrl={avatarUrl}
            size={size}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="min-w-[11rem] border-vp-line bg-vp-surface text-vp-ink"
      >
        <DropdownMenuItem
          onSelect={() => onProfileClick?.()}
          className="cursor-pointer focus:bg-vp-raised focus:text-vp-ink"
        >
          <User className="size-4" aria-hidden />
          Profile
        </DropdownMenuItem>
        {onEditProfileClick ? (
          <DropdownMenuItem
            onSelect={() => onEditProfileClick()}
            className="cursor-pointer focus:bg-vp-raised focus:text-vp-ink"
          >
            <Pencil className="size-4" aria-hidden />
            Edit profile
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="bg-vp-line" />
        <DropdownMenuItem
          onSelect={() => onLogout?.()}
          className="cursor-pointer focus:bg-vp-raised focus:text-vp-ink"
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
