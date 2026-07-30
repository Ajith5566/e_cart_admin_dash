// types/contentBlockTypes.ts
// ✅ Reusable across any module using the block-based content editor (Blog, Pages, ...)

export type ContentBlockType = "editor" | "gallery" | "youtube" | "quote";

export type GalleryImageItem = {
  image: string;       // existing server path; "" for images not yet uploaded
  caption: string;
  file?: File;          // client-only — present only for a newly-added, unsaved image
  previewUrl?: string;  // client-only — object URL for the file above
};

export type ContentBlock = {
  blockId: string;
  type: ContentBlockType;
  label?: string;                // "editor" and "quote" blocks — mandatory heading
  html?: string;                 // "editor" and "quote" blocks
  youtubeUrl?: string;           // "youtube" block
  images?: GalleryImageItem[];   // "gallery" block
};

export const BLOCK_TYPE_LABELS: Record<ContentBlockType, string> = {
  editor: "Editor",
  gallery: "Gallery",
  youtube: "YouTube Video",
  quote: "Quote",
};

let counter = 0;
export const generateBlockId = () => {
  counter += 1;
  return `blk_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`;
};

export const createEmptyBlock = (type: ContentBlockType): ContentBlock => {
  const blockId = generateBlockId();
  switch (type) {
    case "editor":
      return { blockId, type, label: "", html: "" };
    case "quote":
      return { blockId, type, label: "", html: "" };
    case "youtube":
      return { blockId, type, youtubeUrl: "" };
    case "gallery":
      return { blockId, type, images: [] };
  }
};