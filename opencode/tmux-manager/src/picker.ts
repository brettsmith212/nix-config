import {
  getGlobalOption,
  listClients,
  detachClient,
  setGlobalOption,
  runTmux,
  runTmuxRaw,
  shellQuote,
  attachCommand,
} from './tmux';
import { getAllSessions } from './sessions';

function getNestedSession(prefix: string): string | null {
  const match = listClients().find((c) => c.session.startsWith(prefix));
  return match?.session || null;
}

interface HostInfo {
  client: string;
  session: string;
}

function getHost(prefix: string): HostInfo | null {
  const match = listClients().find((c) => !c.session.startsWith(prefix));
  return match ? { client: match.client, session: match.session } : null;
}

function getBinaryPath(): string {
  // In a bun --compile binary, process.execPath is the executable itself.
  if (process.execPath) return process.execPath;

  const result = Bun.spawnSync(['/bin/sh', '-c', 'command -v ocmux'], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (result.exitCode === 0) {
    return new TextDecoder().decode(result.stdout).trim();
  }
  return process.argv[0];
}

export function listCommand(): void {
  const prefix = getGlobalOption('@opencode_session_prefix', 'opencode-');

  // If we're inside a session popup, detach it first so the picker isn't
  // nested inside an opencode session.
  const nested = getNestedSession(prefix);
  if (nested) {
    detachClient(nested);
    for (let i = 0; i < 100; i++) {
      if (!getNestedSession(prefix)) break;
      Bun.sleepSync(50);
    }
  }

  const host = getHost(prefix);
  setGlobalOption('@opencode_parent', host?.client || '');

  const sessions = getAllSessions(prefix);
  if (sessions.length === 0) {
    runTmux(['display-message', 'No opencode sessions']);
    return;
  }

  // Build a picker window: left pane runs the ANSI picker, right pane is a
  // live preview that attaches the selected session.
  //
  // Always create the window on the host session so it doesn't end up inside
  // an opencode session. Use fully qualified targets (session:window.pane)
  // because run-shell may execute in the context of an opencode session.
  const bin = getBinaryPath();
  const ts = host?.session || '';
  const pickerTarget = ts ? `${ts}:opencode-picker` : 'opencode-picker';

  runTmuxRaw(['kill-window', '-t', pickerTarget]);
  runTmux([
    'new-window',
    ...(ts ? ['-t', `${ts}:`] : []),
    '-n', 'opencode-picker',
    '-c', process.cwd(),
    'sleep 1000',
  ]);
  runTmux([
    'split-window',
    '-h',
    '-l', '67%',
    '-t', `${pickerTarget}.0`,
    attachCommand(sessions[0].name, { clearTmuxEnv: true }),
  ]);
  runTmux([
    'respawn-pane', '-k',
    '-t', `${pickerTarget}.0`,
    '-c', process.cwd(),
    `${shellQuote(bin)} picker`,
  ]);
  runTmux(['select-pane', '-t', `${pickerTarget}.0`]);

  // Make sure the parent client is viewing the picker window.
  if (host) {
    runTmuxRaw(['switch-client', '-c', host.client, '-t', pickerTarget]);
  }
}
