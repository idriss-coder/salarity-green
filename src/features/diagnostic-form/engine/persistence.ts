import type { Answers } from "../definition/types";

/**
 * Autosauvegarde dans localStorage. Clé versionnée : un changement de structure du formulaire
 * invalide les brouillons précédents. Tous les accès sont protégés (navigation privée, quota, SSR).
 */
export interface Draft {
  answers: Answers;
  index: number;
  savedAt: number;
}

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function draftKey(version: number): string {
  return `sgr:diagnostic:v${version}`;
}

export function loadDraft(version: number): Draft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(version));
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft;
    if (typeof draft !== "object" || !draft.answers || Date.now() - draft.savedAt > MAX_AGE_MS)
      return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(version: number, draft: Omit<Draft, "savedAt">): void {
  try {
    window.localStorage.setItem(
      draftKey(version),
      JSON.stringify({ ...draft, savedAt: Date.now() }),
    );
  } catch {
    // stockage indisponible : on continue sans autosauvegarde
  }
}

export function clearDraft(version: number): void {
  try {
    window.localStorage.removeItem(draftKey(version));
  } catch {
    // ignore
  }
}
