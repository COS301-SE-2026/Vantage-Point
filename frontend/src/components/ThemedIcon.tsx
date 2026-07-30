interface ThemedIconProps {
  /** Exported light-page asset. */
  readonly light: string;
  /** The same glyph exported from the dark page. */
  readonly dark: string;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  /** Figma layer name, mirrored onto both files. */
  readonly name?: string;
}

/**
 * An icon Figma ships once per theme, because the stroke is baked into the SVG
 * and an <img> can't be recoloured.
 *
 * Swapped by CSS rather than <picture>/srcset (as the logo in DashboardShell
 * does): Vite inlines these SVGs as data: URIs, and srcset splits candidates on
 * commas, so a re-export with comma-separated path data would silently blank
 * the dark glyph. Both files are inlined, so there is no extra request.
 */
export default function ThemedIcon({
  light,
  dark,
  width,
  height,
  className = "",
  name,
}: Readonly<ThemedIconProps>) {
  return (
    <>
      <img
        src={light}
        alt=""
        width={width}
        height={height}
        className={`${className} device-dark:hidden`}
        data-name={name}
      />
      <img
        src={dark}
        alt=""
        width={width}
        height={height}
        className={`hidden ${className} device-dark:block`}
        data-name={name}
      />
    </>
  );
}
