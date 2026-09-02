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

    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],  // ✅ added check list
    [{ indent: "-1" }, { indent: "+1" }],

    [{ align: [] }],
    [{ direction: "rtl" }],                                         // ✅ RTL support

    ["link", "image", "video", "formula"],                          // ✅ added formula

    ["code-block"],

    ["clean"],
    
  ],
   clipboard: {
    matchVisual: false, // ✅ strips visual formatting on paste
  },

  // ✅ HTML source code view button
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


// quillmodule.ts — add a wrapper
/* export const cleanQuill = (html: string) =>
  html.replace(/&nbsp;/g, " ")
      .replace(/<p><br><\/p>/g, "")
      .trim(); */

export const cleanQuill = (html: string) =>
  html
    .replace(/&nbsp;/g, "\u00A0") // ✅ only clean &nbsp;
    .trim();