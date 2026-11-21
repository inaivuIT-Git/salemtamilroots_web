"use client";

import { useEffect } from "react";
import { rememberView, type RecentItem } from "@/lib/recent";

export function TrackView({ item }: { item: Omit<RecentItem, "at"> }) {
  useEffect(() => rememberView(item), [item]);
  return null;
}
