// components/shared/ContentBlockEditor.tsx
// ✅ Reusable block-based content editor. Designed to be dropped into any module
// (Blog, Pages, ...) that needs an ordered sequence of Editor / Gallery / YouTube /
// Quote blocks with drag-and-drop reordering. Uses native HTML5 drag-and-drop —
// no extra dependency required.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy, useRef, useState } from "react";
import {
  type ContentBlock,
  type ContentBlockType,
  type GalleryImageItem,
  BLOCK_TYPE_LABELS,
  createEmptyBlock,
} from "../../types/contentBlockTypes";
import { imgSrc } from "../../utils/imgSrc";
const RichEditor = lazy(() => import('../editor/TiptapEditor'));

const BLOCK_TYPES: ContentBlockType[] = ["editor", "gallery", "youtube", "quote"];

const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
const isEditorEmpty = (html: string) => (html || "").replace(/<[^>]+>/g, "").trim().length === 0;

type Props = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  /** called when a gallery image that was already saved on the server gets removed,
   * so the parent can fire an immediate-delete API call. New (unsaved) images just
   * get dropped from state. */
  onRemoveExistingGalleryImage?: (blockId: string, imagePath: string) => void;
  /** overall "add at least one block" message, shown above the block list */
  error?: string;
  /** blockId -> validation message, set by the parent after a failed submit.
   * Drives the red outline / inline messages on individual blocks. */
  blockErrors?: Record<string, string>;
};

export default function ContentBlockEditor({
  blocks,
  onChange,
  onRemoveExistingGalleryImage,
  error,
  blockErrors = {},
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // ✅ state, not a ref — reading a ref's `.current` during render breaks React's rules
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateBlock = (blockId: string, patch: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.blockId === blockId ? { ...b, ...patch } : b)));
  };

  const addBlock = (type: ContentBlockType) => {
    const block = createEmptyBlock(type);
    onChange([...blocks, block]);
    setAddMenuOpen(false);
    setCollapsed((prev) => ({ ...prev, [block.blockId]: false }));
  };

  const deleteBlock = (blockId: string) => {
    if (!window.confirm("Delete this block? This cannot be undone.")) return;
    onChange(blocks.filter((b) => b.blockId !== blockId));
  };

  const toggleCollapsed = (blockId: string) => {
    setCollapsed((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // ── drag & drop reorder ──────────────────────────────────
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };
  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    const from = draggingIndex;
    if (from === null || from === index) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDraggingIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // ── gallery block helpers ─────────────────────────────────
  const addGalleryFiles = (blockId: string, files: FileList | null) => {
    if (!files) return;
    const block = blocks.find((b) => b.blockId === blockId);
    if (!block) return;
    const newItems: GalleryImageItem[] = Array.from(files).map((file) => ({
      image: "",
      caption: "",
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    updateBlock(blockId, { images: [...(block.images || []), ...newItems] });
  };

  const updateGalleryCaption = (blockId: string, itemIndex: number, caption: string) => {
    const block = blocks.find((b) => b.blockId === blockId);
    if (!block) return;
    const images = (block.images || []).map((img, i) => (i === itemIndex ? { ...img, caption } : img));
    updateBlock(blockId, { images });
  };

  const removeGalleryItem = (blockId: string, itemIndex: number) => {
    const block = blocks.find((b) => b.blockId === blockId);
    if (!block) return;
    const item = (block.images || [])[itemIndex];
    if (!item) return;

    if (item.image && onRemoveExistingGalleryImage) {
      // already saved on the server — parent handles the immediate-delete API call
      onRemoveExistingGalleryImage(blockId, item.image);
    }
    const images = (block.images || []).filter((_, i) => i !== itemIndex);
    updateBlock(blockId, { images });
  };

  return (
    <div>
      {error && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>{error}</div>}

      <div className="d-flex flex-column gap-3">
        {blocks.map((block, index) => {
          const blockError = blockErrors[block.blockId];
          const labelMissing = !!blockError && (block.type === "editor" || block.type === "quote") && !(block.label || "").trim();
          const contentMissing = !!blockError && (block.type === "editor" || block.type === "quote") && isEditorEmpty(block.html || "");

          return (
            <div
              key={block.blockId}
              id={`block-${block.blockId}`}
              tabIndex={-1}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`card shadow-sm ${blockError ? "border-danger" : "border-0"}`}
              style={{
                outline: dragOverIndex === index ? "2px dashed #0d6efd" : "none",
                opacity: draggingIndex === index ? 0.5 : 1,
              }}
            >
              <div className="card-header bg-light d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <span
                    style={{ cursor: "grab", fontSize: "18px", color: "#888" }}
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>
                  <span className="badge bg-secondary">{index + 1}</span>
                  <span className="fw-semibold">{BLOCK_TYPE_LABELS[block.type]}</span>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleCollapsed(block.blockId)}
                  >
                    {collapsed[block.blockId] ? "Expand" : "Collapse"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteBlock(block.blockId)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {blockError && (
                <div className="alert alert-danger py-2 mb-0 rounded-0" style={{ fontSize: "13px" }}>
                  {blockError}
                </div>
              )}

              {!collapsed[block.blockId] && (
                <div className="card-body">
                  {(block.type === "editor" || block.type === "quote") && (
                    <>
                      <label className="form-label">
                        Label(The label is used solely to identify and distinguish the block within the admin panel.) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control mb-3 ${labelMissing ? "is-invalid" : ""}`}
                        placeholder={block.type === "editor" ? "e.g. Background" : "e.g. Client quote"}
                        value={block.label || ""}
                        onChange={(e) => updateBlock(block.blockId, { label: e.target.value })}
                      />
                      {labelMissing && <div className="invalid-feedback d-block mb-2">Label is required</div>}
                    </>
                  )}

                  {block.type === "editor" && (
                    <div className={contentMissing ? "is-invalid" : ""}>
                      <RichEditor
                        value={block.html || ""}
                        onChange={(html) => updateBlock(block.blockId, { html })}
                        placeholder="Start typing..."
                        minHeight={200}
                        maxHeight={500}
                      />
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div className={contentMissing ? "is-invalid" : ""}>
                      <RichEditor
                        value={block.html || ""}
                        onChange={(html) => updateBlock(block.blockId, { html })}
                        placeholder="Enter a highlight quote..."
                        minHeight={120}
                        maxHeight={300}
                      />
                    </div>
                  )}
                  {contentMissing && <div className="text-danger mt-1" style={{ fontSize: "13px" }}>Content is required</div>}

                  {block.type === "youtube" && (
                    <div>
                      <label className="form-label">
                        YouTube URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="url"
                        className={`form-control ${
                          blockError || (block.youtubeUrl && !youtubeRegex.test(block.youtubeUrl)) ? "is-invalid" : ""
                        }`}
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={block.youtubeUrl || ""}
                        onChange={(e) => updateBlock(block.blockId, { youtubeUrl: e.target.value })}
                      />
                      {block.youtubeUrl && !youtubeRegex.test(block.youtubeUrl) && (
                        <div className="invalid-feedback d-block">Please enter a valid YouTube URL</div>
                      )}
                    </div>
                  )}

                  {block.type === "gallery" && (
                    <GalleryBlock
                      block={block}
                      onAddFiles={(files) => addGalleryFiles(block.blockId, files)}
                      onCaptionChange={(i, caption) => updateGalleryCaption(block.blockId, i, caption)}
                      onRemoveItem={(i) => removeGalleryItem(block.blockId, i)}
                      showValidation={!!blockError}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add Block ── */}
      <div className="position-relative mt-3">
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => setAddMenuOpen((v) => !v)}
        >
          + Add Block
        </button>
        {addMenuOpen && (
          <div
            className="border rounded shadow-sm bg-white mt-1 position-absolute"
            style={{ zIndex: 10, minWidth: "200px" }}
          >
            {BLOCK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="btn btn-light w-100 text-start rounded-0"
                onClick={() => addBlock(type)}
              >
                {BLOCK_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>

      {blocks.length === 0 && (
        <p className="text-muted mt-2" style={{ fontSize: "13px" }}>
          No content blocks yet — click &quot;+ Add Block&quot; to start building the article.
        </p>
      )}
    </div>
  );
}

// ── gallery block sub-component ──────────────────────────────
function GalleryBlock({
  block,
  onAddFiles,
  onCaptionChange,
  onRemoveItem,
  showValidation,
}: {
  block: ContentBlock;
  onAddFiles: (files: FileList | null) => void;
  onCaptionChange: (index: number, caption: string) => void;
  onRemoveItem: (index: number) => void;
  showValidation: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const images = block.images || [];

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="d-none"
        onChange={(e) => { onAddFiles(e.target.files); e.target.value = ""; }}
      />
      <button type="button" className="btn btn-outline-dark btn-sm mb-3" onClick={() => inputRef.current?.click()}>
        + Add images
      </button>

      <div className="d-flex flex-wrap gap-3">
        {images.map((item, i) => {
          const captionMissing = showValidation && !item.caption.trim();
          return (
            <div key={i} style={{ width: "150px" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={item.previewUrl || imgSrc(item.image)}
                  alt={item.caption || "gallery"}
                  style={{
                    width: "150px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: item.previewUrl ? "2px solid #0d6efd" : undefined,
                  }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ position: "absolute", top: 4, right: 4, padding: "1px 6px", fontSize: "11px" }}
                  onClick={() => onRemoveItem(i)}
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                className={`form-control form-control-sm mt-1 ${captionMissing ? "is-invalid" : ""}`}
                placeholder="Label (required)"
                value={item.caption}
                onChange={(e) => onCaptionChange(i, e.target.value)}
              />
              {captionMissing && <div className="text-danger" style={{ fontSize: "11px" }}>Label is required</div>}
            </div>
          );
        })}
      </div>

      {images.length === 0 && (
        <p className="text-muted" style={{ fontSize: "12px" }}>
          No images added to this gallery yet{showValidation ? " — add at least one" : ""}.
        </p>
      )}
    </div>
  );
}
/* h */