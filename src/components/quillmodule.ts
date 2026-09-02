import Quill from "quill";
import { htmlEditButton } from "quill-html-edit-button";

Quill.register("modules/htmlEditButton", htmlEditButton);

export const Modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    [{ direction: "rtl" }],
    ["link", "image", "video", "formula"],
    ["code-block"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
  // ✅ fix Enter after link
  keyboard: {
    bindings: {
      enter: {
        key: 13,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: function(this: any) {
          const quill = this.quill;
          const range = quill.getSelection();
          if (!range) return true;

          const [leaf] = quill.getLeaf(range.index);
          if (leaf?.parent?.domNode?.tagName === "A") {
            quill.insertText(range.index, "\n", "user");
            quill.setSelection(range.index + 1, 0);
            return false;
          }
          return true;
        },
      },
    },
  },
  htmlEditButton: {
    debug: false,
    msg: "Edit the content in HTML format",
    okText: "Ok",
    cancelText: "Cancel",
    buttonHTML: `<svg viewBox="0 0 18 18"><polyline points="6 2 2 9 6 16" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2"></polyline><polyline points="12 2 16 9 12 16" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2"></polyline></svg>`,
    buttonTitle: "Show HTML source",
    syntax: false,
    prependSelector: "div#myelement",
    editorModules: {},
  },
};

export const cleanQuill = (html: string) =>
  html
    .replace(/&nbsp;/g, "\u00A0")
    .trim();