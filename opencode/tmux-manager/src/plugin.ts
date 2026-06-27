/**
 * OpenCode plugin that tracks session state (working/idle/waiting) on the
 * tmux session, for display in the picker.
 *
 * Uses the event bus (the `event` hook), which is opencode's equivalent of
 * Claude Code's PreToolUse/Stop/Notification hooks:
 *
 *   session.status {type:"busy"}     -> working   (red, busy)
 *   session.status {type:"idle"}     -> idle      (green, done)
 *   permission.asked / question.asked -> waiting  (yellow, needs input)
 *
 * One opencode process can run several sessions (root chat + `task`
 * sub-agents), each emitting its own status. We set state on the single tmux
 * session (resolved from $TMUX_PANE inside `ocmux state`), so we aggregate
 * across all sessionIDs: waiting if any is waiting, else working if any is
 * busy, else idle.
 */

import type { State } from './types';

async function setState($: any, state: State): Promise<void> {
  try {
    await $`ocmux state ${state}`;
  } catch {
    // state updates are best-effort; never interrupt the agent
  }
}

export const TmuxSessionManager = async ({ $ }: { $: any }) => {
  // Per-session busy/idle status from session.status events.
  const busy = new Set<string>();
  // Per-session outstanding permission/question requests (by request id).
  const pending = new Map<string, Set<string>>();

  let lastPublished: State | null = null;

  function addPending(sessionID: string, id: string): void {
    let set = pending.get(sessionID);
    if (!set) { set = new Set(); pending.set(sessionID, set); }
    set.add(id);
  }

  function removePending(sessionID: string, id: string): void {
    const set = pending.get(sessionID);
    if (!set) return;
    set.delete(id);
    if (set.size === 0) pending.delete(sessionID);
  }

  function forget(sessionID: string): void {
    busy.delete(sessionID);
    pending.delete(sessionID);
  }

  function aggregate(): State {
    if (pending.size > 0) return 'waiting';
    if (busy.size > 0) return 'working';
    return 'idle';
  }

  async function publish(): Promise<void> {
    const next = aggregate();
    if (next === lastPublished) return;
    lastPublished = next;
    await setState($, next);
  }

  await publish(); // initial: idle

  return {
    event: async ({ event }: { event: { type: string; properties?: any } }) => {
      const p = event.properties ?? {};
      const sessionID: string | undefined = p.sessionID;

      switch (event.type) {
        case 'session.status': {
          if (!sessionID) break;
          if (p.status?.type === 'busy') busy.add(sessionID);
          else busy.delete(sessionID); // "idle" or "retry"
          await publish();
          break;
        }

        case 'permission.asked':
        case 'permission.v2.asked':
        case 'question.asked': {
          if (!sessionID || p.id == null) break;
          addPending(sessionID, String(p.id));
          await publish();
          break;
        }

        case 'permission.replied':
        case 'permission.v2.replied':
        case 'question.replied':
        case 'question.rejected': {
          if (!sessionID || p.requestID == null) break;
          removePending(sessionID, String(p.requestID));
          await publish();
          break;
        }

        case 'session.deleted': {
          const id = p.info?.id ?? sessionID;
          if (id) forget(id);
          await publish();
          break;
        }
      }
    },
  };
};
