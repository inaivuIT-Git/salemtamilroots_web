import "server-only";
import sanitizeHtml from "sanitize-html";

/*
  Product texts are written in the seller/admin rich-text editor and stored as HTML.
  Keep simple formatting (paragraphs, lists, bold, italics) and drop everything else,
  so nothing stored in the database can run script or restyle the page.
*/
export function cleanHtml(html?: string | null): string {
  if (!html) return "";
  const out = sanitizeHtml(html, {
    allowedTags: ["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "blockquote", "h3", "h4"],
    allowedAttributes: {},
    transformTags: { h1: "h3", h2: "h3", h5: "h4", h6: "h4", div: "p" },
  }).trim();
  // Editors often leave empty paragraphs behind; treat those as no content.
  return htmlToText(out) ? out : "";
}

export function htmlToText(html?: string | null): string {
  if (!html) return "";
  return sanitizeHtml(html.replace(/<\s*(br|\/p|\/li|\/h\d)\s*\/?>/gi, " "), { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
