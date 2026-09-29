/* eslint-disable @typescript-eslint/no-explicit-any */
// components/editor/RichEditor.tsx
import { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import { TableKit, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"; // ✅ Tiptap v3: TableKit bundles Table, TableRow, TableHeader, TableCell
import { cleanEditorHtml, sanitizePastedHtml } from "./cleanEditorHtml";
import { ResizableImage } from "./ResizableImage";
import { BASE_URL } from "../../services/baseURL";
import { imgSrc } from "../../utils/imgSrc";

// ── Font size extension (adds a `fontSize` attribute to textStyle marks) ──
// Default inclusive behaviour makes the underline mark bleed onto whatever
// you type right after underlined text (e.g. right after pasted content).
// Non-inclusive stops new text past the mark's edge from inheriting it.
const Underline = UnderlineExtension.extend({
  inclusive: false,
});

// ── Link, made non-inclusive ──────────────────────────────────
// By default @tiptap/extension-link derives `inclusive` from the
// `autolink` option, so it ends up `true`. An inclusive mark keeps
// extending onto whatever you type next once the cursor sits at the
// end of a linked run — including after pressing space — which is
// why "next word" kept turning blue/underlined. Forcing `inclusive:
// false` stops the mark from bleeding past its own text, while still
// leaving autolink/paste-link behaviour untouched.
const Link = LinkExtension.extend({
  inclusive: false,
});

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    } as any;
  },
});

// Browsers insert literal &nbsp; (\u00A0) into contentEditable instead of
// regular spaces — especially for consecutive spaces — which is what causes
// visibly stretched gaps (most noticeable inside links, since the mark's
// underline/color renders across the wide nbsp run). This plugin rewrites
// any nbsp characters back to plain spaces directly in the live document as
// you type, so the gap never appears on screen — it doesn't rely on the
// editor being resynced from an external value.
const NoNbsp = Extension.create({
  name: "noNbsp",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) return null;
          let changed = false;
          const tr = newState.tr;
          newState.doc.descendants((node, pos) => {
            if (node.isText && node.text && node.text.indexOf("\u00A0") !== -1) {
              const cleanText = node.text.replace(/\u00A0/g, " ");
              if (cleanText !== node.text) {
                tr.insertText(cleanText, pos, pos + node.text.length);
                changed = true;
              }
            }
          });
          return changed ? tr : null;
        },
      }),
    ];
  },
});

// ── Table row with adjustable height (persisted as inline style on <tr>) ──
const ResizableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: null,
        parseHTML: (el: HTMLElement) => (el.style.height ? parseInt(el.style.height, 10) : null),
        renderHTML: (attrs: any) => (attrs.rowHeight ? { style: `height: ${attrs.rowHeight}px` } : {}),
      },
    };
  },
});

// ── Cell attributes: background color + vertical alignment ──
// Both persist as inline styles on <td>/<th>, so they survive in the
// saved HTML and render on the public site without extra CSS.
const cellAttributes = {
  backgroundColor: {
    default: null,
    parseHTML: (el: HTMLElement) => el.style.backgroundColor || null,
    renderHTML: (attrs: any) =>
      attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor}` } : {},
  },
  verticalAlign: {
    default: null,
    parseHTML: (el: HTMLElement) => el.style.verticalAlign || null,
    renderHTML: (attrs: any) =>
      attrs.verticalAlign ? { style: `vertical-align: ${attrs.verticalAlign}` } : {},
  },
};

const FlexCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellAttributes };
  },
});

const FlexHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellAttributes };
  },
});

const FONT_SIZES = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "60px", "72px"];

const TEXT_COLOR_PRESETS = [
  "#000000", "#374151", "#6b7280", "#9ca3af", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#78350f", "#1e293b",
];

const HIGHLIGHT_PRESETS = [
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#fbcfe8",
  "#e9d5ff", "#c7d2fe", "#bfdbfe", "#a5f3fc", "#a7f3d0",
  "#bbf7d0", "#d9f99d", "#f5f5f4", "#e2e8f0",
];

const CELL_BG_PRESETS = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#1e293b",
  "#fef2f2", "#fff7ed", "#fefce8", "#f0fdf4", "#ecfeff", "#eff6ff",
  "#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#a5f3fc", "#bfdbfe",
  "#e9d5ff", "#fbcfe8",
];

// ── SVG icons ─────────────────────────────────────────────────
const icons = {
  bold:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  underline:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  strike:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4s-5 1.5-5 4c0 1.5 1 2.5 2.5 3"/><path d="M8 18c0 0 1.5 2 4 2s5-1.5 5-4c0-1.5-1-2.5-2.5-3"/></svg>,
  quote:       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
  bulletList:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
  orderedList: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10h2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  indent:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="9 9 13 12 9 15"/><line x1="13" y1="12" x2="21" y2="12"/></svg>,
  outdent:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="7 9 3 12 7 15"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  alignLeft:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>,
  alignCenter: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>,
  alignRight:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>,
  alignJust:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  link:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  unlink:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>,
  image:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  youtube:     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>,
  table:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  cellFill:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="3" y="3" width="9" height="9" fill="currentColor"/></svg>,
  code:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  codeBlock:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="8 10 4 14 8 18"/><polyline points="16 10 20 14 16 18"/></svg>,
  html:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 2 2 9 6 16"/><polyline points="12 2 16 9 12 16"/></svg>,
  undo:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13C5.5 6.5 13 4 18 8s6 12 2 17"/></svg>,
  redo:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13C18.5 6.5 11 4 6 8S0 20 4 21"/></svg>,
  clean:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L11 6.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L11 22.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  chevron:     <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>,
};

function Btn({ onClick, active, disabled, title, children }: {
  onClick:   () => void;
  active?:   boolean;
  disabled?: boolean;
  title?:    string;
  children:  React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        justifyContent: "center",
        width:          "28px",
        height:         "28px",
        background:     active ? "#e2e8f0" : "transparent",
        border:         "1px solid " + (active ? "#94a3b8" : "transparent"),
        borderRadius:   "4px",
        cursor:         disabled ? "not-allowed" : "pointer",
        color:          disabled ? "#ccc" : active ? "#1e293b" : "#475569",
        padding:        0,
        flexShrink:     0,
      }}
    >
      {children}
    </button>
  );
}

// small text button used in the contextual table toolbar
function TextBtn({ onClick, disabled, danger, active, title, children }: {
  onClick:   () => void;
  disabled?: boolean;
  danger?:   boolean;
  active?:   boolean;
  title?:    string;
  children:  React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        fontSize:     "11px",
        padding:      "3px 8px",
        borderRadius: "4px",
        border:       "1px solid " + (active ? "#94a3b8" : "#e2e8f0"),
        background:   active ? "#e2e8f0" : "#fff",
        color:        disabled ? "#ccc" : danger ? "#dc2626" : "#475569",
        cursor:       disabled ? "not-allowed" : "pointer",
        whiteSpace:   "nowrap",
      }}
    >
      {children}
    </button>
  );
}

const Sep = () => (
  <span style={{ width: "1px", height: "18px", background: "#e2e8f0", margin: "0 3px", display: "inline-block", flexShrink: 0 }} />
);

// closes a popover when clicking anywhere outside `ref`
function useOutsideClose(ref: React.RefObject<HTMLDivElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ── Custom color picker popover (replaces the bare native <input type="color"> swatch) ──
function ColorPickerButton({
  label,
  icon,
  presets,
  activeColor,
  onSelect,
  onClear,
  clearLabel,
}: {
  label:        string;
  icon:         React.ReactNode;
  presets:      string[];
  activeColor?: string | null;
  onSelect:     (color: string) => void;
  onClear?:     () => void;
  clearLabel?:  string;
}) {
  const [open, setOpen]     = useState(false);
  const [custom, setCustom] = useState(activeColor || "#000000");
  const wrapRef             = useRef<HTMLDivElement>(null);

  useOutsideClose(wrapRef, open, () => setOpen(false));

  const isValidHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

  const applyCustom = () => {
    if (isValidHex(custom)) {
      onSelect(custom);
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        title={label}
        onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}
        style={{
          display:        "inline-flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "1px",
          width:          "28px",
          height:         "28px",
          background:     open ? "#e2e8f0" : "transparent",
          border:         "1px solid " + (open ? "#94a3b8" : "transparent"),
          borderRadius:   "4px",
          cursor:         "pointer",
          color:          "#475569",
          padding:        0,
        }}
      >
        {icon}
        <span style={{
          width:        "14px",
          height:       "3px",
          borderRadius: "1px",
          background:   activeColor || "#94a3b8",
          border:       "1px solid rgba(0,0,0,0.08)",
        }} />
      </button>

      {open && (
        <div
          style={{
            position:     "absolute",
            top:          "32px",
            left:         0,
            zIndex:       30,
            width:        "204px",
            background:   "#fff",
            border:       "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow:    "0 8px 24px rgba(15, 23, 42, 0.15)",
            padding:      "10px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>{label}</div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "5px", marginBottom: "10px" }}>
            {presets.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onMouseDown={(e) => { e.preventDefault(); onSelect(c); setOpen(false); }}
                style={{
                  width:        "22px",
                  height:       "22px",
                  borderRadius: "5px",
                  background:   c,
                  border:       activeColor === c ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  cursor:       "pointer",
                  padding:      0,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="color"
              value={isValidHex(custom) ? custom : "#000000"}
              onChange={(e) => setCustom(e.target.value)}
              style={{ width: "26px", height: "26px", padding: 0, border: "1px solid #e2e8f0", borderRadius: "5px", cursor: "pointer", flexShrink: 0 }}
              title="Pick a custom color"
            />
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") applyCustom(); }}
              placeholder="#000000"
              style={{ flex: 1, minWidth: 0, fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "4px 6px", fontFamily: "ui-monospace, monospace" }}
            />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyCustom(); }}
              style={{ fontSize: "11px", padding: "5px 8px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", flexShrink: 0 }}
            >
              OK
            </button>
          </div>

          {onClear && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onClear(); setOpen(false); }}
              style={{ marginTop: "8px", width: "100%", fontSize: "11px", padding: "5px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "5px", cursor: "pointer", color: "#475569" }}
            >
              {clearLabel || "Clear"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Table insert popover: hover a grid to pick rows × columns ──
const GRID_MAX = 10;

function TableInsertButton({ onInsert }: {
  onInsert: (rows: number, cols: number, withHeaderRow: boolean) => void;
}) {
  const [open, setOpen]     = useState(false);
  const [hover, setHover]   = useState({ r: 0, c: 0 });
  const [header, setHeader] = useState(true);
  const wrapRef             = useRef<HTMLDivElement>(null);

  useOutsideClose(wrapRef, open, () => { setOpen(false); setHover({ r: 0, c: 0 }); });

  return (
    <div ref={wrapRef} style={{ position: "relative", flexShrink: 0 }}>
      <Btn onClick={() => setOpen((o) => !o)} active={open} title="Insert table">{icons.table}</Btn>

      {open && (
        <div
          style={{
            position:     "absolute",
            top:          "32px",
            left:         0,
            zIndex:       30,
            background:   "#fff",
            border:       "1px solid #e2e8f0",
            borderRadius: "8px",
            boxShadow:    "0 8px 24px rgba(15, 23, 42, 0.15)",
            padding:      "10px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            {hover.r && hover.c ? `${hover.r} × ${hover.c} table` : "Insert table"}
          </div>

          <div
            onMouseLeave={() => setHover({ r: 0, c: 0 })}
            style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_MAX}, 16px)`, gap: "3px" }}
          >
            {Array.from({ length: GRID_MAX * GRID_MAX }).map((_, i) => {
              const r  = Math.floor(i / GRID_MAX) + 1;
              const c  = (i % GRID_MAX) + 1;
              const on = r <= hover.r && c <= hover.c;
              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover({ r, c })}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onInsert(r, c, header);
                    setOpen(false);
                    setHover({ r: 0, c: 0 });
                  }}
                  style={{
                    width:        "16px",
                    height:       "16px",
                    padding:      0,
                    borderRadius: "3px",
                    border:       "1px solid " + (on ? "#3b82f6" : "#cbd5e1"),
                    background:   on ? "#bfdbfe" : "#f8fafc",
                    cursor:       "pointer",
                  }}
                />
              );
            })}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "12px", color: "#475569", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} />
            Header row
          </label>
        </div>
      )}
    </div>
  );
}

type Props = {
  value:        string;
  onChange:     (html: string) => void;
  placeholder?: string;
  minHeight?:   number;
  maxHeight?:   number;
  className?:   string;
};

export default function RichEditor({ value, onChange, placeholder = "Start typing...", minHeight = 200, maxHeight = 500, className = "" }: Props) {
  const imageInputRef            = useRef<HTMLInputElement>(null);
  const [showHtml, setShowHtml]  = useState(false);
  const [htmlValue, setHtmlValue] = useState("");
  const isInternalChange         = useRef(false); // true while the update came from typing in this editor, not an external value change

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        link: false,      // we register our own non-inclusive Link below — StarterKit v3 bundles one by default
        underline: false, // same reasoning for Underline
      }),
      NoNbsp,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      ResizableImage.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ controls: true, nocookie: true }),
      TableKit.configure({
        table: {
          resizable:               true,
          handleWidth:             6,    // wider grab area for column resizing
          cellMinWidth:            60,   // columns can't be squeezed to nothing
          lastColumnResizable:     true,
          allowTableNodeSelection: true,
        },
        tableRow:    false, // replaced by ResizableRow
        tableCell:   false, // replaced by FlexCell
        tableHeader: false, // replaced by FlexHeader
      }),
      ResizableRow,
      FlexCell,
      FlexHeader,
    ],
    content:  value || "<p></p>",
    editorProps: {
      transformPastedHTML(html) {
        return sanitizePastedHtml(html);
      },
    },
    onUpdate: ({ editor }) => {
      let html = cleanEditorHtml(editor.getHTML());
      html = html.replace(new RegExp(BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "");
      isInternalChange.current = true;
      onChange(html);
      if (showHtml) setHtmlValue(html);
    },
  });

  // sync external value (edit mode prefill / switching records) — but skip
  // this when the change we're reacting to just came from the editor itself,
  // otherwise every keystroke would force-reset the doc and wipe out things
  // like a blank line you just typed, or jump the cursor.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    // prefix relative /uploads/ paths with BASE_URL for display
    const displayed = (value || "<p></p>").replace(
      /src="(\/uploads\/[^"]+)"/g,
      `src="${BASE_URL}$1"`
    );
    if (editor.getHTML() === displayed) return;
    editor.commands.setContent(displayed);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // toggle HTML view
  const toggleHtml = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (!showHtml) {
      setHtmlValue(editor.getHTML());
      setShowHtml(true);
    } else {
      // apply HTML back to editor
      const cleaned = cleanEditorHtml(htmlValue);
      editor.commands.setContent(cleaned);
      onChange(cleaned);
      setShowHtml(false);
    }
  }, [editor, showHtml, htmlValue, onChange]);

  // image upload from device
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await fetch(`${BASE_URL}/admin/upload/editor-image`, {
        method:      "POST",
        credentials: "include",
        body:        fd,
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message || "Image upload failed"); return; }
      // insert with full URL so editor displays it
      if (data.url) editor?.chain().focus().setImage({ src: imgSrc(data.url) }).run();
    } catch {
      alert("Image upload failed — please try again");
    }

    e.target.value = "";
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt("Enter YouTube URL:");
    if (!url) return;
    editor?.commands.setYoutubeVideo({ src: url });
  }, [editor]);

  // Clears every manual column width in the current table, so columns
  // share the available width equally again (undo-able like any edit).
  const equalizeColumns = useCallback(() => {
    if (!editor) return;
    const { state, view } = editor;
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name !== "table") continue;
      const start = $from.start(d);
      const tr = state.tr;
      node.descendants((child, pos) => {
        if (child.type.name === "tableCell" || child.type.name === "tableHeader") {
          if (child.attrs.colwidth) tr.setNodeMarkup(start + pos, undefined, { ...child.attrs, colwidth: null });
          return false; // don't descend into cell content
        }
        return true;
      });
      if (tr.docChanged) view.dispatch(tr);
      editor.commands.focus();
      return;
    }
  }, [editor]);

  if (!editor) return null;

  const activeTextColor  = editor.getAttributes("textStyle").color || null;
  const activeHighlight  = editor.isActive("highlight") ? editor.getAttributes("highlight").color : null;
  const activeFontSize   = editor.getAttributes("textStyle").fontSize || "";

  const inTable          = editor.isActive("table");
  const cellAttrs        = editor.isActive("tableHeader") ? editor.getAttributes("tableHeader") : editor.getAttributes("tableCell");
  const activeCellBg     = cellAttrs.backgroundColor || null;
  const activeVAlign     = cellAttrs.verticalAlign || "top";

  return (
    <div className={className} style={{ border: "1px solid #dee2e6", borderRadius: "6px", overflow: "hidden", background: "#fff" }}>

      {/* ── TOOLBAR ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px", padding: "6px 10px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", alignItems: "center" }}>

        {/* Heading */}
        <select
          title="Paragraph style"
          style={{ fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "3px 6px", background: "#fff", color: "#374151", cursor: "pointer", height: "28px", marginRight: "2px" }}
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" :
            editor.isActive("heading", { level: 4 }) ? "4" :
            editor.isActive("heading", { level: 5 }) ? "5" :
            editor.isActive("heading", { level: 6 }) ? "6" : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v) as 1|2|3|4|5|6 }).run();
          }}
        >
          <option value="p">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        {/* Font size */}
        <select
          title="Font size"
          style={{ fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "3px 4px", background: "#fff", color: "#374151", cursor: "pointer", height: "28px", width: "62px", marginRight: "2px" }}
          value={activeFontSize}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) (editor.chain().focus() as any).unsetFontSize().run();
            else (editor.chain().focus() as any).setFontSize(v).run();
          }}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}</option>
          ))}
        </select>

        <Sep />

        {/* Format */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}       active={editor.isActive("bold")}       title="Bold">{icons.bold}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}     active={editor.isActive("italic")}     title="Italic">{icons.italic}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}  active={editor.isActive("underline")}  title="Underline">{icons.underline}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}     active={editor.isActive("strike")}     title="Strikethrough">{icons.strike}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">{icons.quote}</Btn>

        <Sep />

        {/* Color */}
        <ColorPickerButton
          label="Text color"
          icon={<span style={{ fontSize: "12px", fontWeight: 700, lineHeight: 1 }}>A</span>}
          presets={TEXT_COLOR_PRESETS}
          activeColor={activeTextColor}
          onSelect={(c) => editor.chain().focus().setColor(c).run()}
          onClear={() => editor.chain().focus().unsetColor().run()}
          clearLabel="Reset to default color"
        />
        <ColorPickerButton
          label="Highlight color"
          icon={<span style={{ fontSize: "11px", background: activeHighlight || "#ffff00", padding: "0 3px", borderRadius: "2px" }}>A</span>}
          presets={HIGHLIGHT_PRESETS}
          activeColor={activeHighlight}
          onSelect={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
          onClear={() => editor.chain().focus().unsetHighlight().run()}
          clearLabel="Remove highlight"
        />

        <Sep />

        {/* Sub / Super */}
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()}   active={editor.isActive("subscript")}   title="Subscript"><span style={{ fontSize: "11px" }}>x₂</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript"><span style={{ fontSize: "11px" }}>x²</span></Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive("bulletList")}  title="Bullet list">{icons.bulletList}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">{icons.orderedList}</Btn>
        <Btn onClick={() => editor.chain().focus().sinkListItem("listItem").run()} disabled={!editor.can().sinkListItem("listItem")} title="Indent">{icons.indent}</Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem("listItem").run()} disabled={!editor.can().liftListItem("listItem")} title="Outdent">{icons.outdent}</Btn>

        <Sep />

        {/* Align (also works on text inside table cells) */}
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()}    active={editor.isActive({ textAlign: "left" })}    title="Align left">{icons.alignLeft}</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()}  active={editor.isActive({ textAlign: "center" })}  title="Align center">{icons.alignCenter}</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()}   active={editor.isActive({ textAlign: "right" })}   title="Align right">{icons.alignRight}</Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">{icons.alignJust}</Btn>

        <Sep />

        {/* Link */}
        <Btn onClick={addLink}                                              active={editor.isActive("link")} title="Add link">{icons.link}</Btn>
        <Btn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")}   title="Remove link">{icons.unlink}</Btn>

        {/* Image upload from device */}
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
        <Btn onClick={() => imageInputRef.current?.click()} title="Upload image from device">{icons.image}</Btn>

        {/* YouTube */}
        <Btn onClick={addYoutube} title="Insert YouTube video">{icons.youtube}</Btn>

        {/* Table — pick size from grid */}
        <TableInsertButton
          onInsert={(rows, cols, withHeaderRow) =>
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
          }
        />

        <Sep />

        {/* Code */}
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">{icons.codeBlock}</Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive("code")}      title="Inline code">{icons.code}</Btn>

        <Sep />

        {/* Undo / Redo / Clean */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">{icons.undo}</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">{icons.redo}</Btn>
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">{icons.clean}</Btn>

        <Sep />

        {/* HTML source toggle */}
        <Btn onClick={toggleHtml} active={showHtml} title={showHtml ? "Apply HTML & return to editor" : "Edit raw HTML source"}>{icons.html}</Btn>

      </div>

      {/* ── TABLE CONTROLS (only visible while the cursor is inside a table) ── */}
      {inTable && !showHtml && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "6px 10px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", marginRight: "4px" }}>Table</span>

          {/* Rows */}
          <TextBtn onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>+ Row above</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().addRowAfter().run()}  disabled={!editor.can().addRowAfter()}>+ Row below</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().deleteRow().run()}    disabled={!editor.can().deleteRow()} danger>− Row</TextBtn>
          <Sep />

          {/* Columns */}
          <TextBtn onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>+ Col left</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().addColumnAfter().run()}  disabled={!editor.can().addColumnAfter()}>+ Col right</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().deleteColumn().run()}    disabled={!editor.can().deleteColumn()} danger>− Col</TextBtn>
          <TextBtn onClick={equalizeColumns} title="Reset dragged column widths so all columns share the space equally">Equal widths</TextBtn>
          <Sep />

          {/* Headers / merge */}
          <TextBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header row</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>Header col</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().toggleHeaderCell().run()} active={editor.isActive("tableHeader")}>Header cell</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().mergeCells().run()} disabled={!editor.can().mergeCells()} title="Drag across cells first to select them">Merge</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().splitCell().run()}  disabled={!editor.can().splitCell()}>Split</TextBtn>
          <Sep />

          {/* Cell styling */}
          <ColorPickerButton
            label="Cell background"
            icon={icons.cellFill}
            presets={CELL_BG_PRESETS}
            activeColor={activeCellBg}
            onSelect={(c) => editor.chain().focus().setCellAttribute("backgroundColor", c).run()}
            onClear={() => editor.chain().focus().setCellAttribute("backgroundColor", null).run()}
            clearLabel="Remove cell color"
          />
          <TextBtn onClick={() => editor.chain().focus().setCellAttribute("verticalAlign", null).run()}     active={activeVAlign === "top"}    title="Align cell content to top">Top</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().setCellAttribute("verticalAlign", "middle").run()} active={activeVAlign === "middle"} title="Align cell content to middle">Middle</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().setCellAttribute("verticalAlign", "bottom").run()} active={activeVAlign === "bottom"} title="Align cell content to bottom">Bottom</TextBtn>
          <Sep />

          {/* Row height */}
          <TextBtn onClick={() => {
            const h = editor.getAttributes("tableRow").rowHeight || 40;
            editor.chain().focus().updateAttributes("tableRow", { rowHeight: h + 20 }).run();
          }}>Row taller</TextBtn>
          <TextBtn onClick={() => {
            const h = editor.getAttributes("tableRow").rowHeight || 40;
            editor.chain().focus().updateAttributes("tableRow", { rowHeight: Math.max(30, h - 20) }).run();
          }}>Row shorter</TextBtn>
          <TextBtn onClick={() => editor.chain().focus().updateAttributes("tableRow", { rowHeight: null }).run()}>Auto height</TextBtn>
          <Sep />

          <TextBtn onClick={() => editor.chain().focus().deleteTable().run()} danger>Delete table</TextBtn>
        </div>
      )}

      {/* ── EDITOR or HTML SOURCE ── */}
      {showHtml ? (
        <div style={{ position: "relative" }}>
          <textarea
            value={htmlValue}
            onChange={(e) => setHtmlValue(e.target.value)}
            style={{
              width:       "100%",
              minHeight:   `${minHeight}px`,
              fontFamily:  "ui-monospace, monospace",
              fontSize:    "13px",
              lineHeight:  "1.6",
              padding:     "12px 14px",
              border:      "none",
              outline:     "none",
              resize:      "vertical",
              background:  "#1e293b",
              color:       "#e2e8f0",
              boxSizing:   "border-box",
            }}
            spellCheck={false}
          />
          <div style={{ padding: "6px 14px", background: "#0f172a", borderTop: "1px solid #334155", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Editing raw HTML — click the HTML button again to apply changes</span>
            <button
              type="button"
              onClick={toggleHtml}
              style={{ marginLeft: "auto", fontSize: "12px", padding: "3px 10px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Apply & Close
            </button>
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} style={{ minHeight, maxHeight, overflowY: "auto", padding: "12px 14px", fontSize: "14px", lineHeight: "1.7", color: "#1e293b" }} />
      )}

      <style>{`
        .tiptap { outline: none; }
        .tiptap p { margin: 0 0 0.4rem; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap h1 { font-size: 2rem;    font-weight: 700; margin: 1rem 0 0.4rem;  line-height: 1.2; }
        .tiptap h2 { font-size: 1.5rem;  font-weight: 700; margin: 0.9rem 0 0.35rem; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
        .tiptap h4 { font-size: 1.1rem;  font-weight: 600; margin: 0.7rem 0 0.25rem; }
        .tiptap h5,
        .tiptap h6 { font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.3rem; }
        .tiptap ul { list-style: disc;    padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap li { margin-bottom: 0.2rem; }
        .tiptap blockquote { border-left: 3px solid #94a3b8; padding-left: 1rem; color: #64748b; margin: 0.75rem 0; font-style: italic; }
        .tiptap code { background: #f1f5f9; border-radius: 3px; padding: 1px 5px; font-family: ui-monospace, monospace; font-size: 0.875em; color: #e11d48; }
        .tiptap pre  { background: #1e293b; color: #e2e8f0; border-radius: 6px; padding: 12px 16px; font-family: ui-monospace, monospace; font-size: 13px; overflow-x: auto; margin-bottom: 0.75rem; }
        .tiptap pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 4px; margin: 0.5rem 0; display: block; }
        .tiptap iframe { width: 100%; aspect-ratio: 16/9; border-radius: 6px; margin: 0.5rem 0; border: none; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; }

        /* ── Tables ── */
        /* Wrapper scrolls sideways when columns are dragged wider than the editor */
        .tiptap .tableWrapper { overflow-x: auto; overflow-y: hidden; margin: 0.75rem 0; padding: 0 6px 6px 0; overscroll-behavior-x: contain; }
        /* width:100% is only a floor — Tiptap sets an inline width/min-width once columns are resized, which wins */
        .tiptap table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 0; }
        .tiptap td, .tiptap th {
          border: 1px solid #000000;
          padding: 6px 8px;
          vertical-align: top;
          position: relative;
          min-width: 1em;
          box-sizing: border-box;
          overflow-wrap: anywhere;   /* long words/URLs wrap instead of overflowing fixed-width columns */
          word-break: break-word;
        }
        .tiptap th { background: #f1f5f9; font-weight: 600; text-align: left; }
        .tiptap td p, .tiptap th p { margin: 0; }
        .tiptap td ul, .tiptap td ol, .tiptap th ul, .tiptap th ol { margin-bottom: 0; }
        .tiptap td img, .tiptap th img { margin: 0.25rem 0; }
        .tiptap .selectedCell::after { content: ""; position: absolute; inset: 0; background: rgba(59,130,246,0.15); pointer-events: none; z-index: 2; }
        .tiptap .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background: #3b82f6; pointer-events: none; z-index: 20; }
        .tiptap.resize-cursor { cursor: ew-resize; cursor: col-resize; }
      `}</style>
    </div>
  );
}