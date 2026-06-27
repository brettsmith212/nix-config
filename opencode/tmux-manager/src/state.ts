import { runTmuxRaw, runTmux, getGlobalOption } from './tmux';
import type { State } from './types';

export function setState(state: State): void {
  const pane = process.env.TMUX_PANE;
  if (!pane) return;

  const prefix = getGlobalOption('@opencode_session_prefix', 'opencode-');
  const sessionResult = runTmuxRaw(['display-message', '-p', '-t', pane, '#{session_name}']);
  if (sessionResult.exitCode !== 0) return;

  const session = sessionResult.stdout.trim();
  if (!session || !session.startsWith(prefix)) return;

  runTmux(['set-option', '-t', session, '@opencode_state', state]);
  runTmux([
    'set-option',
    '-t',
    session,
    '@opencode_state_at',
    String(Math.floor(Date.now() / 1000)),
  ]);
}
