"use client";

import { useEffect, useRef } from "react";

/**
 * Raccourcis clavier d'un écran (lettres des options). Ignorés quand un champ de saisie a le focus.
 * La table est lue via une ref : l'écouteur n'est posé qu'une fois et appelle toujours les handlers du dernier rendu.
 */
export function useHotkeys(map: Record<string, () => void>) {
  const latest = useRef(map);
  latest.current = map;
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const handler = latest.current[event.key.toUpperCase()];
      if (handler) {
        event.preventDefault();
        handler();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
