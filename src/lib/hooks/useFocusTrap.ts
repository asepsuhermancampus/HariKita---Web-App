"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * useFocusTrap — menahan fokus keyboard di dalam elemen modal saat aktif,
 * memindahkan fokus awal ke elemen pertama, dan mengembalikan fokus ke
 * pemicu semula saat modal ditutup. Mendukung Escape untuk menutup.
 *
 * @param containerRef ref elemen kontainer modal
 * @param active       apakah trap aktif
 * @param onEscape     callback saat tombol Escape ditekan (opsional)
 * @param initialFocusRef elemen yang ingin difokus pertama (opsional)
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape?: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Simpan callback & ref di dalam ref agar perubahan referensinya (mis. inline
  // arrow function pada tiap render) TIDAK me-restart effect focus trap. Kalau
  // tidak, setiap keystroke yang memicu re-render akan memindahkan fokus kembali
  // ke elemen fokus awal (mis. tombol "Batal") — persis bug yang dilaporkan.
  const onEscapeRef = useRef(onEscape);
  const initialFocusRefRef = useRef(initialFocusRef);

  useEffect(() => {
    onEscapeRef.current = onEscape;
    initialFocusRefRef.current = initialFocusRef;
  });

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Simpan elemen yang fokus sebelumnya (pemicu modal).
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Fokus awal.
    const focusTarget = initialFocusRefRef.current?.current ?? getFocusable()[0] ?? container;
    // Beri jeda satu frame agar elemen ter-mount penuh.
    const raf = requestAnimationFrame(() => focusTarget?.focus());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && (activeEl === first || !container.contains(activeEl))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      // Kembalikan fokus ke pemicu semula.
      previouslyFocused.current?.focus?.();
    };
  }, [active, containerRef]);
}
