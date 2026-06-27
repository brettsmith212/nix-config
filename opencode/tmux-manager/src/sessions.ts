import { createHash } from 'crypto';
import { runTmuxRaw } from './tmux';
import type { Session, State } from './types';

// "working" but untouched this long is treated as idle in the UI — a safety
// net for a crashed/disconnected plugin that never emitted its idle event.
const STALE_SECONDS = 300;

export function sessionHash(path: string): string {
  return createHash('sha256').update(path).digest('hex').slice(0, 8);
}

export function sessionNameForPath(path: string, prefix: string): string {
  return `${prefix}${sessionHash(path)}`;
}

export function formatAgo(timestamp: number | null): string {
  if (!timestamp) return '-';
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function formatPath(path: string): string {
  const home = process.env.HOME || '';
  if (home && path.startsWith(home)) {
    return '~' + path.slice(home.length);
  }
  return path;
}

/** Displayed state, downgrading stale "working" sessions to "idle". */
export function effectiveState(session: Session): State | 'unknown' {
  const state = session.state || 'unknown';
  if (state === 'working' && session.stateAt) {
    const age = Math.floor(Date.now() / 1000) - session.stateAt;
    if (age > STALE_SECONDS) return 'idle';
  }
  return state;
}

const SEP = '\t';
const SESSION_FORMAT = [
  '#{session_name}',
  '#{@opencode_state}',
  '#{@opencode_state_at}',
  '#{@opencode_path}',
  '#{@opencode_origin}',
  '#{pane_current_path}',
].join(SEP);

/**
 * Fetch all opencode sessions and their state in a single tmux call. tmux
 * format strings can read user options (#{@opencode_state}, ...), so we avoid
 * the previous O(4N) per-session show-options spawns.
 */
export function getAllSessions(prefix: string): Session[] {
  const result = runTmuxRaw(['list-sessions', '-F', SESSION_FORMAT]);
  if (result.exitCode !== 0 || !result.stdout) return [];

  return result.stdout
    .split('\n')
    .filter((line) => line.startsWith(prefix))
    .map((line) => {
      const [name, state, stateAt, storedPath, origin, panePath] = line.split(SEP);
      return {
        name,
        state: (state || null) as State | null,
        stateAt: stateAt ? parseInt(stateAt, 10) : null,
        path: storedPath || panePath || '',
        origin: origin || null,
      };
    });
}
