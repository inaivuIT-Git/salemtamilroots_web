// Seller descriptions come from a rich-text editor. Show them as plain paragraphs instead of
// injecting HTML, so nothing from the database can run script on the page.
export function htmlToParagraphs(html?: string): string[] {
  if (!html) return [];
  const text = html
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
