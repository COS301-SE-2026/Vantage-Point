import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  X,
} from "lucide-react";
import AdminShell from "./AdminShell";
import {
  addUserToGroup,
  deleteUser,
  disableUser,
  enableUser,
  listUsers,
  registerUserManually,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { AdminUser, AppRole, UserStatus } from "../../types/admin";
import { deriveUserStatus } from "../../types/admin";

const STATUS_COLORS: Record<UserStatus, string> = {
  Active: "bg-green-600",
  Pending: "bg-[#021247]",
  Disabled: "bg-red-600",
};

const ROLES: AppRole[] = ["Player", "Admin", "Super Admin"];
const STATUSES: UserStatus[] = ["Active", "Pending", "Disabled"];

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

// below function added for export to csv functionality, could be a WOW feature for admins to export user data for their own analysis.
function downloadCsv(filename: string, rows: string[][]) {
  const escape = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";
  const assignableRoles: AppRole[] = isSuperAdmin ? ROLES : ["Player"];

  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<AppRole | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUsername, setBusyUsername] = useState<string | null>(null);
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
        });
        if (!cancelled) {
          setAllUsers(res.items);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Failed to load users.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleFilter, statusFilter]);

  const total = allUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageUsers = useMemo(
    () => allUsers.slice((page - 1) * pageSize, page * pageSize),
    [allUsers, page, pageSize],
  );

  const handleToggleEnabled = async (u: AdminUser) => {
    setBusyUsername(u.username);
    try {
      if (u.enabled) {
        await disableUser(u.username);
      } else {
        await enableUser(u.username);
      }
      setAllUsers((prev) =>
        prev.map((x) =>
          x.username === u.username ? { ...x, enabled: !x.enabled } : x,
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyUsername(null);
    }
  };

  const handleAssignRole = async (username: string, role: AppRole) => {
    setBusyUsername(username);
    try {
      await addUserToGroup(username, role);
      setAllUsers((prev) =>
        prev.map((u) => (u.username === username ? { ...u, role } : u)),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Role assignment failed.",
      );
    } finally {
      setBusyUsername(null);
    }
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm("Remove this user? This cannot be undone.")) return;
    setBusyUsername(username);
    try {
      await deleteUser(username);
      setAllUsers((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusyUsername(null);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Username", "Email", "Status", "Role", "Created", "Last Modified"],
      ...allUsers.map((u) => [
        u.username,
        u.email,
        deriveUserStatus(u),
        u.role ?? "Unknown",
        formatDate(u.user_created_date),
        formatDate(u.user_last_modified_date),
      ]),
    ];
    downloadCsv(`users-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <AdminShell>
      <h1 className="mb-4 font-['League',sans-serif] text-2xl font-bold uppercase text-black">
        User Management
      </h1>

      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b border-[#b3b6bc] bg-[#f9fafb] px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as AppRole | "")}
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
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "")}
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
            onClick={handleExport}
            disabled={allUsers.length === 0}
            className="flex items-center gap-1 rounded-full border border-[#a9b4be] bg-white px-3 py-1 text-xs text-[#2e4258] disabled:opacity-50"
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
      <p className="mt-2 text-[11px] text-[#757575]">
        Role shows "Unknown" until assigned this session — the backend doesn't
        expose existing group membership yet.
      </p>

      <div className="overflow-x-auto rounded-b-lg bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-xs">
          <thead>
            <tr className="border-b border-[#d9ebfe]">
              {[
                "Username",
                "Email",
                "Status",
                "Role",
                "Joined",
                "Last Modified",
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
                  colSpan={7}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  Loading users…
                </td>
              </tr>
            ) : null}
            {!loading && pageUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  No users found.
                </td>
              </tr>
            ) : null}
            {pageUsers.map((u) => {
              const isBusy = busyUsername === u.username;
              const status = deriveUserStatus(u);
              const canEditRole =
                isSuperAdmin || u.role === "Player" || u.role === null;
              return (
                <tr
                  key={u.username}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-2.5 text-[#3b5571]">{u.username}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{u.email}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] text-white ${STATUS_COLORS[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {canEditRole ? (
                      <select
                        value={u.role ?? ""}
                        disabled={isBusy}
                        onChange={(e) =>
                          void handleAssignRole(
                            u.username,
                            e.target.value as AppRole,
                          )
                        }
                        className="rounded border border-gray-300 px-1 py-0.5 text-[10px]"
                      >
                        <option value="" disabled>
                          Unknown
                        </option>
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (u.role ?? "Unknown")
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {formatDate(u.user_created_date)}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {timeAgo(u.user_last_modified_date)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleToggleEnabled(u)}
                        className="rounded-full border border-[#a9b4be] px-2 py-1 text-[10px] text-[#2e4258] disabled:opacity-50"
                      >
                        {u.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleDelete(u.username)}
                        aria-label="Delete user"
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
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
            setAllUsers((prev) => [created, ...prev]);
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
