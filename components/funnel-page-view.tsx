"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "../lib/analytics-client";

export function FunnelPageView() {
  const path = usePathname();
  const previousPath = useRef<string | null>(null);
  useEffect(() => {
    if (previousPath.current === path) return;
    previousPath.current = path;
    trackPageView();
  }, [path]);
  return null;
}
