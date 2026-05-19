const wallpaperModules = import.meta.glob<string>("./*.webp", {
  eager: true,
  import: "default",
});

/** Arcane / LoL wallpapers for landing auth background carousels (sorted by filename) */
export const landingBackgroundImages = Object.keys(wallpaperModules)
  .sort()
  .map((path) => wallpaperModules[path]);

export const landingSlideIndices = landingBackgroundImages.map(
  (_, index) => index,
);
