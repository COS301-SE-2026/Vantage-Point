import { useEffect, useState, type FormEvent } from "react";
import AdminShell from "./AdminShell";

interface Asset {
  readonly id: string;
  readonly displayName: string;
  readonly imageUrl: string;
}

interface AssetManagerPageProps {
  readonly title: string;
  readonly idLabel: string;
  readonly idPlaceholder: string;
  readonly namePlaceholder: string;
  readonly load: () => Promise<Asset[]>;
  readonly upload: (id: string, name: string, file: File) => Promise<Asset>;
}

export default function AssetManagerPage({
  title,
  idLabel,
  idPlaceholder,
  namePlaceholder,
  load,
  upload,
}: Readonly<AssetManagerPageProps>) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setAssets(await load());
      } catch {
        setError(`Failed to load ${title.toLowerCase()}.`);
      }
    })();
  }, [load, title]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !name || !file) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await upload(id, name, file);
      setAssets((prev) => [created, ...prev]);
      setId("");
      setName("");
      setFile(null);
    } catch {
      setError("Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell>
      <h1 className="mb-1 font-['League',sans-serif] text-2xl font-bold uppercase text-black">
        {title}
      </h1>
      <p className="mb-4 text-xs text-[#757575]">
        No Figma frame exists for this section yet, so this is styled to match
        Users/Dashboard in the meantime.
      </p>

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mb-6 flex flex-wrap items-end gap-3 rounded-lg bg-[#f9fafb] p-3"
      >
        <label className="text-xs text-[#2e4258]">
          {idLabel}
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={idPlaceholder}
            className="mt-1 block rounded-lg border border-gray-300 px-2 py-1 text-xs"
          />
        </label>
        <label className="text-xs text-[#2e4258]">
          Display name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            className="mt-1 block rounded-lg border border-gray-300 px-2 py-1 text-xs"
          />
        </label>
        <label className="text-xs text-[#2e4258]">
          Image
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block text-xs"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-[#c7c8c9] bg-[#2e4258] px-3 py-1.5 text-xs font-medium text-[#f3f8ff] disabled:opacity-60"
        >
          {submitting ? "Uploading…" : "Upload"}
        </button>
      </form>

      {assets.length === 0 ? (
        <p className="text-sm text-[#757575]">Nothing uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-8">
          {assets.map((a) => (
            <div key={a.id} className="text-center">
              <img
                src={a.imageUrl}
                alt={a.displayName}
                className="mx-auto h-16 w-16 rounded-lg border border-gray-200 object-cover"
              />
              <p className="mt-1 truncate text-[10px] text-[#757575]">
                {a.displayName}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
