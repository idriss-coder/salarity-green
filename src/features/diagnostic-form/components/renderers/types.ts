import type { Question } from "../../definition/types";

/**
 * Contrat commun de tous les renderers : une question, sa valeur, `onChange` pour la mettre à jour,
 * `onSubmit` pour valider et avancer (touche Entrée, sélection d'un choix unique…).
 */
export interface RendererProps<Q extends Question = Question, V = unknown> {
  question: Q;
  value: V | undefined;
  onChange: (value: V) => void;
  onSubmit: () => void;
  error?: string;
  /** Focus automatique à l'affichage de l'écran. */
  autoFocus?: boolean;
}
