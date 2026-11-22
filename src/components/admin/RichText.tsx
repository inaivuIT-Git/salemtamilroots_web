"use client";

import { useEffect, useRef } from "react";

/*
  A small editor for product descriptions: paragraphs, bold, italics and lists, nothing else
  (the shop shows only those; the API cleans everything else on save).
  Pasted text arrives as plain text, so formatting from Word or web pages doesn't come along.
*/
export function RichText({
  id,
  label,
  value,
  onChange,
  lang,
  minRows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (html: string) => void;
  lang?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Set the starting text once; after that the editor owns it (re-setting would move the cursor).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && document.activeElement !== ref.current) ref.current.innerHTML = value;
  }, [value]);

  const report = () => onChange(ref.current?.innerHTML ?? "");
  const exec = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd);
    report();
  };
  const tool = "rounded px-2 py-1 text-xs font-semibold text-ink hover:bg-[#e6e9e4]";

  return (
    <div className="flex flex-col gap-1">
      <span id={`${id}-label`} className="text-xs font-medium text-muted">{label}</span>
      <div className="rounded-lg border border-line bg-white focus-within:border-forest-600">
        <div className="flex gap-1 border-b border-line px-1.5 py-1" role="toolbar" aria-label={`${label} formatting`}>
          <button type="button" className={`${tool} font-bold`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} aria-label="Bold">B</button>
          <button type="button" className={`${tool} italic`} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} aria-label="Italic">I</button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")}>• List</button>
          <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")}>1. List</button>
        </div>
        <div
          ref={ref}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={`${id}-label`}
          lang={lang}
          contentEditable
          suppressContentEditableWarning
          className="px-3 py-2 text-sm outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
          style={{ minHeight: `${minRows * 1.6}rem` }}
          onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
          onInput={report}
          onBlur={report}
          onPaste={(e) => {
            e.preventDefault();
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
            report();
          }}
        />
      </div>
    </div>
  );
}
