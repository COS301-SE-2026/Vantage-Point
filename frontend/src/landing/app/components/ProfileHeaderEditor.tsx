import { useEffect, useRef, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { ApiError } from "../api/client";
import {
  deleteAvatar,
  updateMe,
  updateRiotId,
  uploadAvatar,
} from "../api/user";
import { resolveAvatarUrl } from "../lib/avatarUrl";
import { parseRiotId } from "../lib/riotId";
import type { PlayerProfile } from "../types/profile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ProfileHeaderEditorProps {
  readonly profile: PlayerProfile;
  readonly onSaved: () => Promise<void>;
}

export default function ProfileHeaderEditor({
  profile,
  onSaved,
}: Readonly<ProfileHeaderEditorProps>) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [riotId, setRiotId] = useState(
    profile.riot_id_tag === "Not linked" ? "" : profile.riot_id_tag,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    resolveAvatarUrl(profile.avatar_url),
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setDisplayName(profile.display_name);
      setRiotId(
        profile.riot_id_tag === "Not linked" ? "" : profile.riot_id_tag,
      );
      setAvatarPreview(resolveAvatarUrl(profile.avatar_url));
      setPendingFile(null);
      setRemoveAvatar(false);
    }
  }, [profile, editing]);

  const resetForm = () => {
    setDisplayName(profile.display_name);
    setRiotId(profile.riot_id_tag === "Not linked" ? "" : profile.riot_id_tag);
    setAvatarPreview(resolveAvatarUrl(profile.avatar_url));
    setPendingFile(null);
    setRemoveAvatar(false);
    setError(null);
  };

  const handleCancel = () => {
    resetForm();
    setEditing(false);
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) {
      return;
    }
    setPendingFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setError("Display name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateMe({ display_name: trimmedName });

      if (removeAvatar && profile.avatar_url) {
        await deleteAvatar();
      } else if (pendingFile) {
        const result = await uploadAvatar(pendingFile);
        setAvatarPreview(resolveAvatarUrl(result.avatar_url));
      }

      const trimmedRiot = riotId.trim();
      const currentRiot =
        profile.riot_id_tag === "Not linked" ? "" : profile.riot_id_tag;
      if (trimmedRiot && trimmedRiot !== currentRiot) {
        parseRiotId(trimmedRiot);
        await updateRiotId(trimmedRiot);
      }

      await onSaved();
      setEditing(false);
      setPendingFile(null);
      setRemoveAvatar(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const viewAvatarSrc = resolveAvatarUrl(profile.avatar_url);

  if (!editing) {
    return (
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <Avatar className="size-[96px]">
            {viewAvatarSrc ? (
              <AvatarImage
                src={viewAvatarSrc}
                alt=""
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-[#404040] font-['Inter:Semi_Bold',sans-serif] text-[28px] font-semibold text-white">
              {profile.avatar_initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate font-['Inter:Semi_Bold',sans-serif] text-[28px] font-semibold leading-tight text-[#1e1e1e]">
              {profile.display_name}
            </h1>
            <p className="mt-1 font-['Inter:Regular',sans-serif] text-[16px] text-[#757575]">
              {profile.riot_id_tag}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setEditing(true);
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-[#d9d9d9] px-4 py-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#525252] transition-colors hover:bg-[#f5f5f5]"
        >
          <Pencil className="size-4" aria-hidden />
          Edit profile
        </button>
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#525252]"
            aria-label="Change profile photo"
          >
            <span
              className="pointer-events-none absolute inset-0 z-10 rounded-full ring-2 ring-dashed ring-[#a3a3a3] ring-offset-2 ring-offset-white transition-colors group-hover:ring-[#525252]"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/35"
              aria-hidden
            >
              <span className="flex flex-col items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera
                  className="size-6 text-white"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="font-['Inter:Semi_Bold',sans-serif] text-[11px] font-semibold text-white">
                  Change
                </span>
              </span>
            </span>
            <Avatar className="size-[96px]">
              {avatarPreview ? (
                <AvatarImage
                  src={avatarPreview}
                  alt=""
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-[#404040] font-['Inter:Semi_Bold',sans-serif] text-[28px] font-semibold text-white">
                {profile.avatar_initials}
              </AvatarFallback>
            </Avatar>
            <span
              className="pointer-events-none absolute bottom-0 right-0 z-20 flex size-8 items-center justify-center rounded-full bg-[#1e1e1e] text-white shadow-md ring-2 ring-white"
              aria-hidden
            >
              <Camera className="size-4" strokeWidth={2} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-['Inter:Regular',sans-serif] text-[12px] text-[#525252] underline hover:text-[#1e1e1e]"
          >
            Change photo
          </button>
          {profile.avatar_url || avatarPreview ? (
            <button
              type="button"
              onClick={() => {
                setPendingFile(null);
                setRemoveAvatar(true);
                setAvatarPreview(undefined);
              }}
              className="font-['Inter:Regular',sans-serif] text-[12px] text-[#757575] underline hover:text-[#1e1e1e]"
            >
              Remove photo
            </button>
          ) : null}
        </div>

        <div className="flex min-w-[240px] flex-1 flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#525252]">
              Display name
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg border border-[#d9d9d9] px-3 py-2 font-['Inter:Regular',sans-serif] text-[16px] text-[#1e1e1e] outline-none focus:border-[#525252]"
              maxLength={64}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-['Inter:Semi_Bold',sans-serif] text-[12px] font-semibold text-[#525252]">
              Riot ID
            </span>
            <input
              type="text"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              placeholder="Player#EUW"
              className="rounded-lg border border-[#d9d9d9] px-3 py-2 font-['Inter:Regular',sans-serif] text-[16px] text-[#1e1e1e] outline-none focus:border-[#525252]"
            />
            <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#757575]">
              Verified via Riot API. Match history follows the linked account.
            </span>
          </label>
        </div>
      </div>

      {error ? (
        <p
          className="font-['Inter:Regular',sans-serif] text-[14px] text-red-600"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-lg bg-[#1e1e1e] px-5 py-2 font-['Inter:Semi_Bold',sans-serif] text-[14px] font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-lg border border-[#d9d9d9] px-5 py-2 font-['Inter:Regular',sans-serif] text-[14px] text-[#525252] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </header>
  );
}
