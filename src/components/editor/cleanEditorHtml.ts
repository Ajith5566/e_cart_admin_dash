// components/editor/cleanEditorHtml.ts
//
// Collapses runs of *multiple* consecutive empty paragraphs/headings (the
// "extra space" left behind by mashing Enter, or by pasted content full of
// blank blocks) down to a single blank paragraph — instead of deleting
// every blank block outright. This still stops runaway gaps, but lets a
// single deliberate blank line (pressing Enter twice, once) survive.
//
// Kept in its own file (not in RichEditor.tsx) so that file only exports a
// component, which is required for Next.js Fast Refresh to work correctly.
export function cleanEditorHtml(html: string): string {
  if (!html) return html;
  const EMPTY_INNER = "(?:\\s|&nbsp;|<br\\s*/?>|<span[^>]*>(?:\\s|&nbsp;|<br\\s*/?>)*<\\/span>)*";
  const emptyBlock  = `<(?:p|h[1-6])(?:\\s[^>]*)?>${EMPTY_INNER}<\\/(?:p|h[1-6])>`;
  // 2 or more empty blocks back-to-back (allowing whitespace/newlines between them)
  const emptyRun = new RegExp(`(?:${emptyBlock}\\s*){2,}`, "gi");
  let cleaned = html.replace(emptyRun, "<p></p>");  

  // Tiptap/browsers encode ordinary spaces between words as &nbsp; on save.
  // Convert those back to real spaces, then collapse any resulting runs of
  // 2+ plain spaces down to one.
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]{2,}/g, " ");

  return cleaned.trim();
}

// Inline mark tags whose formatting shouldn't visually "leak" onto
// adjacent whitespace (link color/underline, underline, bold, italic).
const INLINE_MARK_TAGS = "a|u|strong|em|b|i";

// Pushes leading/trailing whitespace (plain spaces or &nbsp;) that sits
// *inside* an inline mark tag out to the *outside* of it, e.g.
//   "<a href=..."> word </a>"   ->  " <a href="..."word</a> "
// Source HTML (Word, Google Docs, other sites) very often wraps a trailing
// or leading space inside the <a>/<u>/<strong> tag itself. Left as-is, that
// space carries the mark's styling forever — which is what produced the
// lone underlined/colored space right before "service." after pasting.
// Moving the whitespace outside the tag means the mark only ever covers
// real text, so typing or editing around it never inherits stray styling.
function unstickWhitespaceFromMarks(html: string): string {
  let out = html;
  let prev: string;
  // run repeatedly: nested tags (e.g. <a><strong> word</strong></a>) need
  // more than one pass to fully unwrap from the inside out.
  do {
    prev = out;
    out = out
      // leading whitespace just inside an opening tag -> move before it
      .replace(
        new RegExp(`(<(?:${INLINE_MARK_TAGS})(?:\\s[^>]*)?>)((?:\\s|&nbsp;)+)`, "gi"),
        "$2$1"
      )
      // trailing whitespace just inside a closing tag -> move after it
      .replace(
        new RegExp(`((?:\\s|&nbsp;)+)(<\\/(?:${INLINE_MARK_TAGS})>)`, "gi"),
        "$2$1"
      );
  } while (out !== prev);
  return out;
}

// Runs on paste, before content ever reaches the editor doc. Pasted HTML
// (from Word, Google Docs, other sites) often carries markup the regular
// save-time cleaner doesn't recognise: mso-* styles, <o:p> tags, <font>
// tags, empty spans with only whitespace/&nbsp;, and long runs of &nbsp;
// used purely for spacing. This strips that out and then reuses
// cleanEditorHtml to drop any empty blocks that result.
export function sanitizePastedHtml(html: string): string {
  if (!html) return html;
  const cleaned = html
    // drop Word's conditional/meta comments and xml namespaces
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<o:p>[\s\S]*?<\/o:p>/gi, "")
    .replace(/<\/?o:[^>]*>/gi, "")
    .replace(/<\/?w:[^>]*>/gi, "")
    .replace(/<\/?xml[^>]*>/gi, "")
    // strip mso-* and other Word inline styles, and class/lang attrs Word adds
    .replace(/\sstyle="[^"]*mso-[^"]*"/gi, "")
    .replace(/\sclass="Mso[^"]*"/gi, "")
    .replace(/\slang="[^"]*"/gi, "")
    // unwrap <font> tags (keep their text)
    .replace(/<\/?font[^>]*>/gi, "")
    // collapse runs of 2+ &nbsp; (used by Word/Docs purely for spacing) to a single space
    .replace(/(?:&nbsp;\s*){2,}/gi, " ")
    // drop empty spans left behind once nbsp runs are collapsed
    .replace(/<span[^>]*>\s*<\/span>/gi, "");

  return cleanEditorHtml(unstickWhitespaceFromMarks(cleaned));
}