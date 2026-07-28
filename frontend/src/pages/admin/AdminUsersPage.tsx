import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import AdminShell from "./AdminShell";
import {
  deleteUser,
  listUsers,
  registerUserManually,
  updateUser,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import type { AdminUser, AppRole, UserStatus } from "../../types/admin";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLORS: Record<UserStatus, string> = {
  Active: "bg-green-600",
  Banned: "bg-red-600",
  Pending: "bg-[#021247]",
  Suspended: "bg-orange-500",
  Inactive: "bg-gray-400",
};

const ROLES: AppRole[] = ["Player", "Admin", "Super Admin"];
const STATUSES: UserStatus[] = [
  "Active",
  "Banned",
  "Pending",
  "Suspended",
  "Inactive",
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";
  const assignableRoles: AppRole[] = isSuperAdmin ? ROLES : ["Player"];
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<AppRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    role: AppRole;
    status: UserStatus;
  } | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listUsers({
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          page,
          pageSize,
        });
        if (!cancelled) {
          setUsers(res.items);
          setTotal(res.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load users.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roleFilter, statusFilter, page, pageSize]);

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setEditDraft({ role: u.role, status: u.status });
  };

  const saveEdit = async (userId: string) => {
    if (!editDraft) return;
    try {
      const updated = await updateUser(userId, editDraft);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminShell>
      <h1 className="mb-4 font-['League',sans-serif] text-2xl font-bold uppercase text-black">
        User Management
      </h1>

      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-[#b3b6bc] bg-[#f9fafb] px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value as AppRole | "");
            }}
            className="rounded-full border border-[#a9b4be] bg-white px-2 py-1 text-xs text-[#2e4258]"
          >
            <option value="">Role</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value as UserStatus | "");
            }}
            className="rounded-full border border-[#a9b4be] bg-white px-2 py-1 text-xs text-[#2e4258]"
          >
            <option value="">Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-[#a9b4be] bg-white px-3 py-1 text-xs text-[#2e4258]"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="flex items-center gap-1 rounded-full border border-[#c7c8c9] bg-[#2e4258] px-3 py-1 text-xs font-medium text-[#f3f8ff]"
          >
            + Register User
          </button>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-b-lg bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-xs">
          <thead>
            <tr className="border-b border-[#d9ebfe]">
              {[
                "Name",
                "Email",
                "Username",
                "Status",
                "Role",
                "Joined Date",
                "Last Active",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[9px] font-medium uppercase text-[#757575]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  Loading users…
                </td>
              </tr>
            ) : null}
            {!loading && users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  No users found.
                </td>
              </tr>
            ) : null}
            {users.map((u) => {
              const isEditing = editingId === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="text-[#3b5571]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{u.email}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{u.username}</td>
                  <td className="px-3 py-2.5">
                    {isEditing && editDraft ? (
                      <select
                        value={editDraft.status}
                        onChange={(e) =>
                          setEditDraft((d) =>
                            d
                              ? { ...d, status: e.target.value as UserStatus }
                              : d,
                          )
                        }
                        className="rounded border border-gray-300 px-1 py-0.5 text-[10px]"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] text-white ${STATUS_COLORS[u.status]}`}
                      >
                        {u.status}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {isEditing && editDraft ? (
                      <select
                        value={editDraft.role}
                        onChange={(e) =>
                          setEditDraft((d) =>
                            d ? { ...d, role: e.target.value as AppRole } : d,
                          )
                        }
                        className="rounded border border-gray-300 px-1 py-0.5 text-[10px]"
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {formatDate(u.joined_at)}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {timeAgo(u.last_active_at)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void saveEdit(u.id)}
                            aria-label="Save"
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            aria-label="Cancel"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {isSuperAdmin || u.role === "Player" ? (
                            <button
                              type="button"
                              onClick={() => startEdit(u)}
                              aria-label="Edit user"
                              className="text-[#2e4258] hover:text-black"
                            >
                              <Pencil className="size-4" />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => void handleDelete(u.id)}
                            aria-label="Delete user"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-col items-center justify-between gap-2 text-xs sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#2e4258]">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            className="flex items-center gap-1 rounded-full border border-[#ddd] bg-white px-2 py-1"
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="font-medium text-[#2e4258]">of {total} rows</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-2 font-bold text-[#2e4258]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
            className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronsRight className="size-4" />
          </button>
        </div>
      </div>

      {registerOpen ? (
        <RegisterUserModal
          onClose={() => setRegisterOpen(false)}
          onCreated={(created) => {
            setUsers((prev) => [created, ...prev]);
            setRegisterOpen(false);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function RegisterUserModal({
  onClose,
  onCreated,
}: Readonly<{
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}>) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await registerUserManually({
        email,
        display_name: displayName,
        password,
      });
      onCreated(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-['League',sans-serif] text-lg font-bold text-black">
            Register user
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <label className="block">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            Temporary password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          {error ? <p className="text-red-600">{error}</p> : null}
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit()}
          className="mt-5 w-full rounded-full bg-[#2e4258] px-3 py-2 text-sm font-medium text-[#f3f8ff] disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create user"}
        </button>
      </div>
    </div>
  );
}
