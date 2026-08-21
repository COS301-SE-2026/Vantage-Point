import AssetManagerPage from "./AssetManagerPage";
import { listMapAssets, uploadMapAsset } from "../../api/admin";

export default function AdminMapAssetsPage() {
  return (
    <AssetManagerPage
      title="Map Assets"
      idLabel="Map ID"
      idPlaceholder="11"
      namePlaceholder="Summoner's Rift"
      load={async () =>
        (await listMapAssets()).map((m) => ({
          id: String(m.map_id),
          displayName: m.display_name,
          imageUrl: m.image_url,
        }))
      }
      upload={async (id, name, file) => {
        const created = await uploadMapAsset(Number(id), name, file);
        return {
          id: String(created.map_id),
          displayName: created.display_name,
          imageUrl: created.image_url,
        };
      }}
    />
  );
}
