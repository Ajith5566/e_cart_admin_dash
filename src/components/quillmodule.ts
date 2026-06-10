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

  // ✅ HTML source code view button
  htmlEditButton: {
    debug: false,
    msg: "Edit the content in HTML format",
    okText: "Ok",
    cancelText: "Cancel",
    buttonHTML: "&lt;&gt;",
    buttonTitle: "Show HTML source",
    syntax: false,
    prependSelector: "div#myelement",
    editorModules: {},
  },
};