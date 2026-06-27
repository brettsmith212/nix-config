export interface TmuxResult {
  stdout: string;
  exitCode: number;
}

export function runTmuxRaw(args: string[]): TmuxResult {
  const proc = Bun.spawnSync(['tmux', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  return {
    stdout: new TextDecoder().decode(proc.stdout).trimEnd(),
    exitCode: proc.exitCode,
  };
}

export function runTmux(args: string[]): string {
  const result = runTmuxRaw(args);
  if (result.exitCode !== 0) {
    throw new Error(`tmux ${args.join(' ')} failed with code ${result.exitCode}`);
  }
  return result.stdout;
}

export function getGlobalOption(name: string, defaultValue: string): string {
  const result = runTmuxRaw(['show-option', '-gqv', name]);
  return result.stdout || defaultValue;
}

export function getSessionOption(session: string, name: string): string | null {
  const result = runTmuxRaw(['show-options', '-qv', '-t', session, name]);
  return result.stdout || null;
}

export function setSessionOption(session: string, name: string, value: string): void {
  runTmux(['set-option', '-t', session, name, value]);
}

export function setGlobalOption(name: string, value: string): void {
  runTmux(['set-option', '-g', name, value]);
}

/** Single-quote a string for safe interpolation into a shell command. */
export function shellQuote(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

/**
 * Build a `tmux attach-session` command string.
 * Pass clearTmuxEnv when the command runs inside another tmux client (e.g. a
 * preview split) so tmux doesn't refuse with "sessions should be nested with
 * care".
 */
export function attachCommand(name: string, opts?: { clearTmuxEnv?: boolean }): string {
  const env = opts?.clearTmuxEnv ? 'env -u TMUX ' : '';
  return `${env}tmux attach-session -t ${shellQuote(name)}`;
}

export interface ClientInfo {
  client: string;
  session: string;
}

export function listClients(): ClientInfo[] {
  const result = runTmuxRaw(['list-clients', '-F', '#{client_name} #{session_name}']);
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split('\n').map((line) => {
    const [client, ...sessionParts] = line.split(' ');
    return { client, session: sessionParts.join(' ') };
  });
}

export function hasSession(name: string): boolean {
  return runTmuxRaw(['has-session', '-t', name]).exitCode === 0;
}

export function newSession(name: string, cwd: string, command: string): void {
  runTmux(['new-session', '-d', '-s', name, '-c', cwd, command]);
}

export function killSession(name: string): void {
  runTmux(['kill-session', '-t', name]);
}

export function detachClient(session: string): void {
  runTmux(['detach-client', '-s', session]);
}

export function displayMessage(format: string, target?: string): string {
  const args = ['display-message', '-p'];
  if (target) args.push('-t', target);
  args.push(format);
  return runTmux(args);
}

export function displayPopup(args: {
  width: string;
  height: string;
  command: string;
  client?: string;
}): void {
  const tmuxArgs = ['display-popup', '-w', args.width, '-h', args.height, '-E', args.command];
  if (args.client) {
    tmuxArgs.splice(1, 0, '-c', args.client);
  }
  runTmux(tmuxArgs);
}
