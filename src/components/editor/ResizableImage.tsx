/* eslint-disable @typescript-eslint/no-explicit-any */
// components/editor/ResizableImage.tsx
import { useCallback, useRef, useState } from "react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import Image from "@tiptap/extension-image";

const MIN_SIZE = 40;

type HandlePos = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { pos: HandlePos; cursor: string; style: React.CSSProperties }[] = [
  { pos: "nw", cursor: "nwse-resize", style: { top: "-6px",    left: "-6px" } },
  { pos: "n",  cursor: "ns-resize",   style: { top: "-6px",    left: "50%", marginLeft: "-6px" } },
  { pos: "ne", cursor: "nesw-resize", style: { top: "-6px",    right: "-6px" } },
  { pos: "e",  cursor: "ew-resize",   style: { top: "50%",     right: "-6px", marginTop: "-6px" } },
  { pos: "se", cursor: "nwse-resize", style: { bottom: "-6px", right: "-6px" } },
  { pos: "s",  cursor: "ns-resize",   style: { bottom: "-6px", left: "50%", marginLeft: "-6px" } },
  { pos: "sw", cursor: "nesw-resize", style: { bottom: "-6px", left: "-6px" } },
  { pos: "w",  cursor: "ew-resize",   style: { top: "50%",     left: "-6px", marginTop: "-6px" } },
];

const isCorner = (pos: HandlePos) => pos === "nw" || pos === "ne" || pos === "se" || pos === "sw";
// which edge each handle drags from — used to decide the sign of the delta
const growsLeft   = (pos: HandlePos) => pos === "nw" || pos === "w" || pos === "sw";
const growsUp     = (pos: HandlePos) => pos === "nw" || pos === "n" || pos === "ne";

function ResizableImageView({ node, updateAttributes, selected, deleteNode }: any) {
  const imgRef    = useRef<HTMLImageElement>(null);
  const dragState = useRef<{
    handle: HandlePos;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    ratio: number;
  } | null>(null);
  const [live, setLive] = useState<{ width: number; height: number } | null>(null);

  const beginResize = useCallback((handle: HandlePos) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect   = imgRef.current?.getBoundingClientRect();
    const startWidth  = rect?.width  || 200;
    const startHeight = rect?.height || 200;
    dragState.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth,
      startHeight,
      ratio: startWidth / (startHeight || 1),
    };

    const compute = (clientX: number, clientY: number) => {
      const d = dragState.current!;
      const dx = clientX - d.startX;
      const dy = clientY - d.startY;

      let width  = d.startWidth;
      let height = d.startHeight;

      if (isCorner(d.handle)) {
        // corners resize proportionally — use whichever axis moved more
        const signedDx = growsLeft(d.handle) ? -dx : dx;
        width  = Math.max(MIN_SIZE, Math.round(d.startWidth + signedDx));
        height = Math.max(MIN_SIZE, Math.round(width / d.ratio));
      } else if (d.handle === "e" || d.handle === "w") {
        const signedDx = growsLeft(d.handle) ? -dx : dx;
        width  = Math.max(MIN_SIZE, Math.round(d.startWidth + signedDx));
        height = d.startHeight; // width-only stretch
      } else {
        const signedDy = growsUp(d.handle) ? -dy : dy;
        height = Math.max(MIN_SIZE, Math.round(d.startHeight + signedDy));
        width  = d.startWidth; // height-only stretch
      }
      return { width, height };
    };

    const onMove = (ev: PointerEvent) => setLive(compute(ev.clientX, ev.clientY));
    const onUp   = (ev: PointerEvent) => {
      const final = compute(ev.clientX, ev.clientY);
      updateAttributes({ width: final.width, height: final.height });
      dragState.current = null;
      setLive(null);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [updateAttributes]);

  const width  = live?.width  ?? node.attrs.width  ?? undefined;
  const height = live?.height ?? node.attrs.height ?? undefined;

  return (
    <NodeViewWrapper
      as="span"
      style={{ display: "inline-block", position: "relative", lineHeight: 0, maxWidth: "100%" }}
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || ""}
        style={{
          width:         width  ? `${width}px`  : "auto",
          height:        height ? `${height}px` : "auto",
          maxWidth:      "100%",
          display:       "block",
          borderRadius:  "4px",
          outline:       selected ? "2px solid #3b82f6" : "none",
          outlineOffset: "2px",
        }}
        draggable={false}
      />
      {selected && (
        <>
          <span
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
            title="Remove image"
            style={{
              position:       "absolute",
              top:            "-10px",
              right:          "-10px",
              width:          "20px",
              height:         "20px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              background:     "#ef4444",
              color:          "#fff",
              border:         "2px solid #fff",
              borderRadius:   "50%",
              boxShadow:      "0 1px 3px rgba(0,0,0,0.3)",
              cursor:         "pointer",
              fontSize:       "12px",
              lineHeight:     1,
              zIndex:         11,
            }}
          >
            ✕
          </span>
          {HANDLES.map(({ pos, cursor, style }) => (
            <span
              key={pos}
              onPointerDown={beginResize(pos)}
              title="Drag to resize"
              style={{
                position:     "absolute",
                width:        "10px",
                height:       "10px",
                background:   "#fff",
                border:       "2px solid #3b82f6",
                borderRadius: "2px",
                boxShadow:    "0 1px 2px rgba(0,0,0,0.25)",
                cursor,
                touchAction:  "none",
                zIndex:       10,
                ...style,
              }}
            />
          ))}
          {live && (
            <span
              style={{
                position:     "absolute",
                top:          "-26px",
                left:         "50%",
                transform:    "translateX(-50%)",
                background:   "#1e293b",
                color:        "#fff",
                fontSize:     "11px",
                padding:      "2px 6px",
                borderRadius: "4px",
                whiteSpace:   "nowrap",
                zIndex:       10,
              }}
            >
              {live.width} × {live.height}
            </span>
          )}
        </>
      )}
    </NodeViewWrapper>
  );
}

// Extends the standard Image extension with `width`/`height` attributes
// (persisted as inline styles on save) and a React node view that adds
// Word-style corner + edge resize handles directly in the editor.
export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const attr = element.getAttribute("width");
          if (attr) return parseInt(attr, 10);
          if (element.style.width) return parseInt(element.style.width, 10);
          return null;
        },
        renderHTML: (attributes: { width?: number | null; height?: number | null }) => {
          if (!attributes.width) return {};
          const h = attributes.height ? ` height: ${attributes.height}px;` : "";
          return { style: `width: ${attributes.width}px;${h} max-width: 100%;` };
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const attr = element.getAttribute("height");
          if (attr) return parseInt(attr, 10);
          if (element.style.height) return parseInt(element.style.height, 10);
          return null;
        },
        // rendering handled together with width above, to avoid duplicate style attrs
        renderHTML: () => ({}),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;