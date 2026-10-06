/**
 * Client-safe action contract.
 *
 * Plain module on purpose: forms import it alongside their `"use server"`
 * actions, so nothing here may pull in `server-only` or Next server APIs.
 */

/** Result every auth/account server action returns to its form. */
export interface ActionState {
  ok: boolean;
  error?: string;
  /** Optional success note (e.g. "Submitted for moderation"). */
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** State a form starts in before its first submit. */
export const IDLE_STATE: ActionState = { ok: false };

/** First message for a field — forms show one error per input at a time. */
export function firstError(state: ActionState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0];
}

/** Form-wide message: either the action's `error` or a `_form` field error. */
export function formError(state: ActionState): string | undefined {
  return state.error ?? state.fieldErrors?._form?.[0];
}
