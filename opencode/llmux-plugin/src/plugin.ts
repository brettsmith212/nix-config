/**
 * OpenCode plugin shim that tracks session state (working/idle/waiting) on
 * the tmux session, for display in the picker.
 *
 * The actual state management and tmux interaction now live in the Go
 * `llmux` binary. This plugin simply translates OpenCode's event bus into
 * `llmux state <working|waiting|idle>` calls.
 *
 * Event mapping:
 *   session.status {type:"busy"}     -> working   (red, busy)
 *   session.status {type:"idle"}     -> idle      (green, done)
 *   permission.asked / question.asked -> waiting  (yellow, needs input)
 *
 * One opencode process can run several sessions (root chat + `task`
 * sub-agents), each emitting its own status. `llmux state` resolves the
 * tmux session from $TMUX_PANE, so we aggregate across all sessionIDs:
 * waiting if any is waiting, else working if any is busy, else idle.
 */

type State = 'working' | 'waiting' | 'idle';

async function setState($: any, state: State): Promise<boolean> {
  try {
    await $`llmux state ${state}`;
    return true;
  } catch {
    // state updates are best-effort; never interrupt the agent
    return false;
  }
}

export const TmuxSessionManager = async ({ $ }: { $: any }) => {
  // Per-session busy/retry/idle status from session.status events.
  const active = new Set<string>();
  const failed = new Set<string>();
  // Per-session outstanding permission/question requests (by request id).
  const pending = new Map<string, Set<string>>();

  let lastPublished: State | null = null;
  let publishing = false;

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
    active.delete(sessionID);
    failed.delete(sessionID);
    pending.delete(sessionID);
  }

  function aggregate(): State {
    if (pending.size > 0 || failed.size > 0) return 'waiting';
    if (active.size > 0) return 'working';
    return 'idle';
  }

  async function publish(): Promise<void> {
    if (publishing) return;
    publishing = true;
    try {
      while (true) {
        const next = aggregate();
        if (next === lastPublished) return;
        if (!(await setState($, next))) return;
        lastPublished = next;
      }
    } finally {
      publishing = false;
    }
  }

  await publish(); // initial: idle

  return {
    event: async ({ event }: { event: { type: string; properties?: any } }) => {
      const p = event.properties ?? {};
      const sessionID: string | undefined = p.sessionID;

      switch (event.type) {
        case 'session.status': {
          if (!sessionID) break;
          if (p.status?.type === 'busy' || p.status?.type === 'retry') {
            active.add(sessionID);
            failed.delete(sessionID);
          } else {
            active.delete(sessionID);
          }
          await publish();
          break;
        }

        case 'session.error': {
          if (!sessionID) break;
          active.delete(sessionID);
          failed.add(sessionID);
          await publish();
          break;
        }

        case 'session.idle': {
          if (!sessionID) break;
          active.delete(sessionID);
          await publish();
          break;
        }

        case 'permission.asked':
        case 'permission.v2.asked':
        case 'question.asked':
        case 'question.v2.asked': {
          if (!sessionID || p.id == null) break;
          addPending(sessionID, String(p.id));
          await publish();
          break;
        }

        case 'permission.replied':
        case 'permission.v2.replied':
        case 'question.replied':
        case 'question.rejected':
        case 'question.v2.replied':
        case 'question.v2.rejected': {
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
