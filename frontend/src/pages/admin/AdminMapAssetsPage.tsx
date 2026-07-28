import AssetManagerPage from "./AssetManagerPage";
import { listMapAssets, uploadMapAsset } from "../../api/admin";

export default function AdminMapAssetsPage() {
  return (
    <AssetManagerPage
      title="Map Assets"
      idLabel="Map ID"
      idPlaceholder="summoners_rift"
      namePlaceholder="Summoner's Rift"
      load={async () =>
        (await listMapAssets()).map((m) => ({
          id: m.map_id,
          displayName: m.display_name,
          imageUrl: m.image_url,
        }))
      }
      upload={async (id, name, file) => {
        const created = await uploadMapAsset(id, name, file);
        return {
          id: created.map_id,
          displayName: created.display_name,
          imageUrl: created.image_url,
        };
      }}
    />
  );
}