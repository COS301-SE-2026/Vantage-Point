import { useCallback, useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import {
  flagSessionForDeletion,
  hardDeleteSession,
  listMatchSessions,
  unflagSessionForDeletion,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { AdminMatchSession } from "../../types/admin";

export default function AdminMatchesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";

  const [sessions, setSessions] = useState<AdminMatchSession[]>([]);
  const [mapName, setMapName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMatchSessions({
        mapName: mapName || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSessions(res.items);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load sessions.",
      );
    } finally {
      setLoading(false);
    }
  }, [mapName, startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFlag = async (session: AdminMatchSession) => {
    setBusyId(session.id);
    try {
      const updated =
        session.deletion_status === "flagged"
          ? await unflagSessionForDeletion(session.id)
          : await flagSessionForDeletion(session.id);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? updated : s)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleHardDelete = async (sessionId: string) => {
    if (
      !window.confirm("Permanently delete this session and all its data now?")
    )
      return;
    setBusyId(sessionId);
    try {
      await hardDeleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell>
      <h1 className="mb-1 font-['League',sans-serif] text-2xl font-bold uppercase text-black">
        Match Data
      </h1>
      <p className="mb-4 text-xs text-[#757575]">
        No Figma frame exists for this section yet ("Data Ingestion" was still a
        blank shell), so this is styled to match Users/Dashboard in the
        meantime.
      </p>

      <div className="mb-3 flex flex-wrap items-end gap-3 rounded-t-lg border-b border-[#b3b6bc] bg-[#f9fafb] px-3 py-2">
        <label className="text-xs text-[#2e4258]">
          Map
          <input
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder="Summoner's Rift"
            className="mt-1 block rounded-full border border-[#a9b4be] px-2 py-1 text-xs"
          />
        </label>
        <label className="text-xs text-[#2e4258]">
          From
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block rounded-full border border-[#a9b4be] px-2 py-1 text-xs"
          />
        </label>
        <label className="text-xs text-[#2e4258]">
          To
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block rounded-full border border-[#a9b4be] px-2 py-1 text-xs"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-[#c7c8c9] bg-[#2e4258] px-3 py-1 text-xs font-medium text-[#f3f8ff]"
        >
          Apply filters
        </button>
      </div>

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-x-auto rounded-b-lg bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-[#d9ebfe]">
              {["Match", "Map", "Players", "Played", "Status", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-[9px] font-medium uppercase text-[#757575]"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  Loading sessions…
                </td>
              </tr>
            ) : null}
            {!loading && sessions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-[#757575]"
                >
                  No match sessions found.
                </td>
              </tr>
            ) : null}
            {sessions.map((s) => {
              const isBusy = busyId === s.id;
              const isFlagged = s.deletion_status === "flagged";
              return (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="px-3 py-2.5 font-mono text-[#3b5571]">
                    {s.match_id}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">{s.map_name}</td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {s.player_count}
                  </td>
                  <td className="px-3 py-2.5 text-[#3b5571]">
                    {new Date(s.played_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] text-white ${
                        isFlagged ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {isFlagged ? "Marked for deletion" : "Active"}
                    </span>
                  </td>
                  <td className="space-x-2 px-3 py-2.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleFlag(s)}
                      className="rounded-full border border-[#a9b4be] px-2 py-1 text-[10px] text-[#2e4258] disabled:opacity-50"
                    >
                      {isFlagged ? "Unmark" : "Mark for deletion"}
                    </button>
                    {isSuperAdmin ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleHardDelete(s.id)}
                        className="rounded-full border border-red-300 bg-red-600 px-2 py-1 text-[10px] text-white disabled:opacity-50"
                      >
                        Delete now
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
