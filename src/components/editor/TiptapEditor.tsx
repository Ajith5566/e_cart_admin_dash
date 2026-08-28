// components/editor/TiptapEditor.tsx
// Drop-in replacement for ReactQuill — same props: value, onChange
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

type Props = {
  value:       string;
  onChange:    (html: string) => void;
  placeholder?: string;
  minHeight?:  number; // px
};

// ── toolbar button ────────────────────────────────────────────
function ToolbarBtn({
  onClick, active, disabled, title, children,
}: {
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
        background:   active ? "#e2e8f0" : "transparent",
        border:       "1px solid " + (active ? "#94a3b8" : "transparent"),
        borderRadius: "4px",
        padding:      "3px 7px",
        cursor:       disabled ? "not-allowed" : "pointer",
        fontWeight:   active ? 700 : 400,
        fontSize:     "13px",
        lineHeight:   "1.4",
        color:        disabled ? "#aaa" : "#222",
        minWidth:     "28px",
      }}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight   = 200,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick:        false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content:    value || "",
    onUpdate:   ({ editor }) => onChange(editor.getHTML()),
  });

  // sync external value changes (e.g. edit mode prefill)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "");
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div style={{ border: "1px solid #dee2e6", borderRadius: "6px", overflow: "hidden" }}>
      {/* ── TOOLBAR ── */}
      <div style={{
        display:        "flex",
        flexWrap:       "wrap",
        gap:            "2px",
        padding:        "6px 8px",
        background:     "#f8f9fa",
        borderBottom:   "1px solid #dee2e6",
        alignItems:     "center",
      }}>
        {/* Heading */}
        <select
          style={{ fontSize: "13px", border: "1px solid #dee2e6", borderRadius: "4px", padding: "2px 4px", background: "#fff" }}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(val) as 1|2|3 }).run();
          }}
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" : "p"
          }
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Bold, Italic, Underline, Strike */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")} title="Bold"><b>B</b></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")} title="Italic"><i>I</i></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")} title="Underline"><u>U</u></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarBtn>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")} title="Bullet List">≡</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")} title="Numbered List">1.</ToolbarBtn>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Blockquote, Code */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")} title="Blockquote">"</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")} title="Inline Code">{"`"}</ToolbarBtn>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })} title="Align Left">◀</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })} title="Center">▬</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })} title="Align Right">▶</ToolbarBtn>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Link */}
        <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Add Link">🔗</ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")} title="Remove Link">🔗✕</ToolbarBtn>

        <span style={{ width: "1px", height: "22px", background: "#dee2e6", margin: "0 4px" }} />

        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} title="Undo">↩</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} title="Redo">↪</ToolbarBtn>
      </div>

      {/* ── EDITOR AREA ── */}
      <EditorContent
        editor={editor}
        style={{ minHeight, padding: "12px 14px", fontSize: "14px", lineHeight: "1.6" }}
      />

      {/* ── EDITOR STYLES ── */}
      <style>{`
        .tiptap { outline: none; }
        .tiptap p { margin: 0 0 0.75rem; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .tiptap h2 { font-size: 1.4rem;  font-weight: 700; margin: 1rem 0 0.5rem; }
        .tiptap h3 { font-size: 1.15rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .tiptap ul { list-style: disc;    padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap li { margin-bottom: 0.2rem; }
        .tiptap blockquote { border-left: 3px solid #cbd5e1; padding-left: 1rem; color: #64748b; margin: 0.75rem 0; }
        .tiptap code { background: #f1f5f9; border-radius: 3px; padding: 1px 5px; font-family: monospace; font-size: 13px; }
        .tiptap a { color: #3b82f6; text-decoration: underline; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}