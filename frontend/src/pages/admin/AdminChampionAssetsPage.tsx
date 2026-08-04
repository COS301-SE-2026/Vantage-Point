import AssetManagerPage from "./AssetManagerPage";
import { listChampionAssets, uploadChampionAsset } from "../../api/admin";

export default function AdminChampionAssetsPage() {
  return (
    <AssetManagerPage
      title="Champion Assets"
      idLabel="Champion ID"
      idPlaceholder="ahri"
      namePlaceholder="Ahri"
      load={async () =>
        (await listChampionAssets()).map((c) => ({
          id: c.champion_id,
          displayName: c.display_name,
          imageUrl: c.image_url,
        }))
      }
      upload={async (id, name, file) => {
        const created = await uploadChampionAsset(id, name, file);
        return {
          id: created.champion_id,
          displayName: created.display_name,
          imageUrl: created.image_url,
        };
      }}
    />
  );
}
