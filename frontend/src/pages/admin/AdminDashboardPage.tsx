import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import AdminShell from "./AdminShell";
import {
  getDashboardMetrics,
  getErrorLog,
  getSiteTraffic,
  markErrorReviewed,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import type {
  DashboardMetrics,
  ErrorLogEntry,
  SiteTrafficPoint,
} from "../../types/admin";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [traffic, setTraffic] = useState<SiteTrafficPoint[]>([]);
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [m, t, e] = await Promise.all([
          getDashboardMetrics(),
          getSiteTraffic(),
          getErrorLog(),
        ]);
        setMetrics(m);
        setTraffic(t);
        setErrors(e);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load dashboard.",
        );
      }
    })();
  }, []);

  const toggleReviewed = async (entry: ErrorLogEntry) => {
    const next = !entry.reviewed;
    setErrors((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, reviewed: next } : e)),
    );
    try {
      await markErrorReviewed(entry.id, next);
    } catch {
      setErrors((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
    }
  };

  return (
    <AdminShell>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <h2 className="mb-2 border-b border-black pb-1 text-lg font-semibold text-[#1e1e1e] device-dark:border-[#929292] device-dark:text-white">
            Site Traffic
          </h2>
          <div className="h-72 w-full text-[#757575] device-dark:text-[#929292]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...traffic]}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "currentColor" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor"  }}
                  tickFormatter={(v: number) => `${v}x`}
                />
                <Bar
                  dataKey="relative_load"
                  fill="#bfe3fb"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f0f0f0] p-4 text-sm device-dark:bg-[#2a2a2a]">
          <h3 className="mb-2 font-semibold text-[#1e1e1e] device-dark:text-white">Metrics</h3>
          <dl className="space-y-1 text-[#3b5571]">
            <Row label="Active Users" value={metrics?.active_users} />
            <Row label="Inactive Users" value={metrics?.inactive_users} />
            <Row
              label="Matches (last 5 months)"
              value={metrics?.matches_last_5_months}
            />
            <Row label="Matches (all time)" value={metrics?.matches_all_time} />
          </dl>
          <h3 className="mb-2 mt-4 font-semibold text-[#1e1e1e] device-dark:text-white">
            Storage Used
          </h3>
          <dl className="space-y-1 text-[#3b5571]">
            <Row label="Matches" value={metrics?.storage_matches_mb} />
            <Row label="User Profiles" value={metrics?.storage_profiles_mb} />
            <Row label="Other" value={metrics?.storage_other_mb} />
          </dl>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg bg-white shadow-sm device-dark:bg-[#2a2a2a]">
        <table className="w-full min-w-[600px] text-xs">
          <thead>
            <tr className="border-b border-[#d9ebfe] device-dark:border-[#3a3939]">
              {["Error Code", "Error Message", "Date", "Reviewed"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-[9px] font-medium uppercase text-[#757575] device-dark:text-[#929292]"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {errors.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-[#757575] device-dark:text-[#929292]"
                >
                  No errors logged.
                </td>
              </tr>
            ) : null}
            {errors.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 device-dark:border-[#3a3939]">
                <td className="px-3 py-2.5 text-[#3b5571] device-dark:text-[#e5e5e5]">
                  #{e.error_code}</td>
                <td className="px-3 py-2.5 text-[#3b5571] device-dark:text-[#e5e5e5]">
                  {e.error_message}
                </td>
                <td className="px-3 py-2.5 text-[#3b5571] device-dark:text-[#e5e5e5]">
                  {new Date(e.occurred_at).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={e.reviewed}
                    onChange={() => void toggleReviewed(e)}
                    className="size-4 accent-[#2e4258] device-dark:accent-[#f5f5f5]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Row({
  label,
  value,
}: Readonly<{ label: string; value: number | undefined }>) {
  return (
    <div className="flex justify-between device-dark:text-[#e5e5e5]">
      <span>{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
