const wallpaperModules = import.meta.glob<string>(
  "../assets/images/champions/*.webp",
  {
    eager: true,
    import: "default",
  },
);

/** Champion splash art for auth background carousels (sorted by filename) */
export const authBackgroundImages = Object.keys(wallpaperModules)
  .sort()
  .map((path) => wallpaperModules[path]);

export const authSlideIndices = authBackgroundImages.map((_, index) => index);
