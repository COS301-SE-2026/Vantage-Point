interface ThemedIconProps {
  /** Exported light-page asset. Kept in the API for the callers that still
   *  pass both, and used if a surface ever needs the dark-on-light glyph. */
  readonly light: string;
  /** The same glyph exported from the dark page. */
  readonly dark: string;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  /** Figma layer name, mirrored onto the file. */
  readonly name?: string;
  /** Render the light export instead. Nothing in the dashboard does. */
  readonly onLight?: boolean;
}

/**
 * An icon Figma ships once per theme, because the stroke is baked into the SVG
 * and an <img> can't be recoloured.
 *
 * Every surface that uses these is now dark, so only one file is rendered. It
 * used to ship both and let a `device-dark:` class pick, which meant two
 * `<img>` elements per glyph and a dependency on the OS theme the dashboard no
 * longer follows.
 */
export default function ThemedIcon({
  light,
  dark,
  width,
  height,
  className = "",
  name,
  onLight = false,
}: Readonly<ThemedIconProps>) {
  return (
    <img
      src={onLight ? light : dark}
      alt=""
      width={width}
      height={height}
      className={className}
      data-name={name}
    />
  );
}
