import { persistentBoolean } from "@nanostores/persistent";

export const $isSticky = persistentBoolean("sticky-cursor-state", true);

// set to false if reduce
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (mediaQuery.matches) {
    $isSticky.set(false);
  }

  mediaQuery.addEventListener("change", (e) => {
    if (e.matches) $isSticky.set(false); // if change to reduce then set to false
  });
}

export function toggleStickyCursor() {
  $isSticky.set(!$isSticky.get());
}
