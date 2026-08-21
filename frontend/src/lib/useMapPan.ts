import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface MapPanHandlers {
  readonly onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  readonly onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  readonly onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  readonly onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
}

export interface MapPan {
  /** Goes on the element being transformed, and is what the offsets are measured against. */
  readonly attach: (node: HTMLElement | null) => void;
  /** Ready to drop on `style.transform`; pan and zoom in the order CSS needs them. */
  readonly transform: string;
  readonly dragging: boolean;
  /** False at 1x, where there is nothing outside the frame to drag into view. */
  readonly pannable: boolean;
  readonly handlers: MapPanHandlers;
}

interface Offset {
  x: number;
  y: number;
}

const CENTRED: Offset = { x: 0, y: 0 };

/**
 * Drag-to-pan for a zoomed map.
 *
 * The transform is `translate(...) scale(...)`, which CSS applies right to left: the
 * scale happens first, so the translate that follows is in plain screen pixels and a
 * pointer that moves 10px moves the map 10px, at any zoom.
 *
 * Scaling from the centre pushes half the overflow past each edge, so
 * `(scale - 1) * size / 2` is as far as the map can travel before its own edge would
 * come into frame. Everything is clamped to that, including whatever offset is already
 * held when the zoom changes under it.
 */
export function useMapPan(scale: number): MapPan {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [offset, setOffset] = useState<Offset>(CENTRED);
  const [dragging, setDragging] = useState(false);

  /** Pointer position and offset at the moment the drag started. */
  const origin = useRef<{
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const clamp = useCallback(
    (next: Offset): Offset => {
      const node = nodeRef.current;
      if (!node || scale <= 1) return CENTRED;

      const maxX = ((scale - 1) * node.clientWidth) / 2;
      const maxY = ((scale - 1) * node.clientHeight) / 2;
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [scale],
  );

  // Zooming out shrinks the room the map has to move in, so a view that was dragged
  // to a corner has to be pulled back inside the smaller bounds rather than left
  // showing a strip of nothing.
  useEffect(() => {
    setOffset((current) => {
      const next = clamp(current);
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [clamp]);

  const attach = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (scale <= 1 || event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      origin.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      };
      setDragging(true);
    },
    [scale, offset.x, offset.y],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = origin.current;
      if (!start) return;
      setOffset(
        clamp({
          x: start.offsetX + (event.clientX - start.pointerX),
          y: start.offsetY + (event.clientY - start.pointerY),
        }),
      );
    },
    [clamp],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!origin.current) return;
    origin.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return {
    attach,
    transform: `translate(${String(offset.x)}px, ${String(offset.y)}px) scale(${String(scale)})`,
    dragging,
    pannable: scale > 1,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
