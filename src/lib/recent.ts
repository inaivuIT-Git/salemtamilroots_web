"use client";

// Recently viewed products, kept on this device only (no account needed).
import type { ProductSummary } from "./types";

const KEY = "str_recent_v1";
const MAX = 12;
export type RecentItem = Pick<ProductSummary, "id" | "slug" | "name" | "image" | "price" | "mrp" | "variantLabel"> & { at: number };

export function readRecent(): RecentItem[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function rememberView(p: Omit<RecentItem, "at">) {
  try {
    const next = [{ ...p, at: Date.now() }, ...readRecent().filter((x) => x.slug !== p.slug)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: nothing to remember */
  }
}
