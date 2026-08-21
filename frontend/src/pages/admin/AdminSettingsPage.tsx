import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import { getPlatformSettings, setRegistrationsOpen } from "../../api/admin";
import { ApiError } from "../../api/client";

export default function AdminSettingsPage() {
  const [registrationsOpen, setRegistrationsOpenState] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await getPlatformSettings();
        setRegistrationsOpenState(s.registrations_open);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load settings.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async () => {
    if (toggling) return;

    const next = !registrationsOpen;
    setToggling(true);
    setError(null);

    // Optimistic update
    setRegistrationsOpenState(next);

    try {
      await setRegistrationsOpen(next);
      setToast(
        next
          ? "Registrations are now enabled."
          : "Registrations are now disabled.",
      );
      window.setTimeout(() => setToast(null), 3000);
    } catch (err) {
      // Revert on failure
      setRegistrationsOpenState(!next);
      setError(
        err instanceof ApiError ? err.message : "Failed to update setting.",
      );
    } finally {
      setToggling(false);
    }
  };

  return (
    <AdminShell>
      <h1 className="mb-1 font-['League',sans-serif] text-2xl font-bold uppercase text-black device-dark:text-white">
        Settings
      </h1>
      <p className="mb-4 text-xs text-[#757575] device-dark:text-[#929292]">
        No Figma frame exists for this section yet, so this is styled to match
        Users/Dashboard in the meantime.
      </p>

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

      {toast ? (
        <div className="mb-2 rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 device-dark:bg-green-900 device-dark:text-green-200">
          {toast}
        </div>
      ) : null}

      <div className="max-w-md rounded-2xl bg-[#f0f0f0] p-4 device-dark:bg-[#2a2a2a]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1e1e1e] device-dark:text-white">
              Allow new registrations
            </p>
            <p className="text-xs text-[#757575] device-dark:text-[#929292]">
              When off, the public signup flow is disabled platform-wide
              (FR-A8).
            </p>
          </div>
          <button
            type="button"
            disabled={loading || toggling}
            onClick={() => void handleToggle()}
            role="switch"
            aria-checked={registrationsOpen}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              registrationsOpen
                ? "bg-[#2e4258] device-dark:bg-[#2c2c2c]"
                : "bg-gray-300 device-dark:bg-[#4a4949]"
            }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                registrationsOpen ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
