import {
  getGlobalOption,
  getSessionOption,
  killSession,
  runTmux,
  runTmuxRaw,
  attachCommand,
} from './tmux';
import { getAllSessions, formatAgo, formatPath, effectiveState } from './sessions';
import type { Session } from './types';

const WINDOW_NAME = 'opencode-picker';

// ── Catppuccin Mocha ──────────────────────────────────────────────
const C = {
  base:     [30, 30, 46],
  mantle:   [24, 24, 37],
  crust:    [17, 17, 27],
  surface0: [49, 50, 68],
  surface1: [69, 71, 90],
  surface2: [88, 91, 112],
  overlay0: [108, 112, 134],
  overlay2: [147, 153, 178],
  subtext0: [166, 173, 200],
  text:     [205, 214, 244],
  blue:     [137, 180, 250],
  green:    [166, 227, 161],
  red:      [243, 139, 168],
  yellow:   [249, 226, 175],
  mauve:    [203, 166, 247],
  peach:    [250, 179, 135],
  teal:     [148, 226, 213],
} as const;

type RGB = readonly [number, number, number];

// ── ANSI primitives ───────────────────────────────────────────────
const RST  = '\x1b[0m';
const BOLD = '\x1b[1m';

const fgc = (c: RGB) => `\x1b[38;2;${c[0]};${c[1]};${c[2]}m`;
const bgc = (c: RGB) => `\x1b[48;2;${c[0]};${c[1]};${c[2]}m`;

/**
 * Write a line at the given row. If bgColor is set, fills the entire
 * line width with that background. Content should use fgOnly() helpers
 * so RST codes don't kill the background mid-line.
 */
function writeLine(
  row: number,
  cols: number,
  content: string,
): void {
  process.stdout.write(`\x1b[${row};1H\x1b[2K${content}${RST}`);
}

/**
 * Write a full-width line with a background color that spans the
 * entire line. Content must only change foreground (no RST mid-line).
 */
function writeLineBg(
  row: number,
  cols: number,
  content: string,
  bgColor: RGB,
): void {
  const bg = bgc(bgColor);
  process.stdout.write(`\x1b[${row};1H${bg}${' '.repeat(cols)}${RST}`);
  process.stdout.write(`\x1b[${row};1H${bg}${content}${RST}`);
}

// ── Preview pane management ───────────────────────────────────────
function updatePreview(sessionName: string): void {
  const cmd = attachCommand(sessionName, { clearTmuxEnv: true });
  const listResult = runTmuxRaw(['list-panes', '-t', WINDOW_NAME, '-F', '#{pane_index}']);
  if (listResult.exitCode !== 0) return;

  const panes = listResult.stdout.split('\n').filter(Boolean);
  if (panes.length > 1) {
    runTmuxRaw(['respawn-pane', '-k', '-t', `:${WINDOW_NAME}.1`, cmd]);
  } else {
    runTmux(['split-window', '-h', '-l', '67%', '-t', `:${WINDOW_NAME}.0`, cmd]);
  }
  runTmux(['select-pane', '-t', `:${WINDOW_NAME}.0`]);
}

// ── String helpers ────────────────────────────────────────────────
function truncate(str: string, width: number): string {
  if (str.length <= width) return str;
  return str.slice(0, width - 1) + '…';
}

// ── Item rendering ────────────────────────────────────────────────
function stateColor(state: string): RGB {
  switch (state) {
    case 'working': return C.red;
    case 'idle':    return C.green;
    case 'waiting': return C.yellow;
    default:        return C.overlay0;
  }
}

function drawItem(
  session: Session,
  width: number,
  selected: boolean,
  row: number,
  cols: number,
): number {
  const inner = width - 6;
  const stateStr = effectiveState(session);
  const sc = stateColor(stateStr);
  const ago = formatAgo(session.stateAt);
  const pathStr = truncate(formatPath(session.path) || '(no path)', inner);
  const nameStr = truncate(session.name, inner);

  if (selected) {
    // Selected: surface0 bg, blue accent bar on left, state dot keeps
    // its color. Use only fgc() changes — no RST mid-line.
    const accent = fgc(C.blue);
    const dot    = fgc(sc);
    const txt    = fgc(C.text);
    const muted  = fgc(C.overlay2);

    const line1 = `${accent}┃${dot} ● ${txt}${stateStr}  ${muted}${ago}`;
    const line2 = `${accent}┃${txt}${BOLD}   ${pathStr}`;
    const line3 = `${accent}┃${muted}   ${nameStr}`;

    writeLineBg(row,     cols, line1, C.surface0);
    writeLineBg(row + 1, cols, line2, C.surface0);
    writeLineBg(row + 2, cols, line3, C.surface0);
  } else {
    // Unselected: no background, transparent
    const dot   = fgc(sc);
    const txt   = fgc(C.subtext0);
    const path  = fgc(C.text);
    const muted = fgc(C.overlay0);

    const line1 = `  ${dot}● ${txt}${stateStr}${RST}  ${muted}${ago}${RST}`;
    const line2 = `    ${path}${BOLD}${pathStr}${RST}`;
    const line3 = `    ${muted}${nameStr}${RST}`;

    writeLine(row,     cols, line1);
    writeLine(row + 1, cols, line2);
    writeLine(row + 2, cols, line3);
  }

  return row + 3;
}

// ── Screen control ────────────────────────────────────────────────
function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

// ── Key parsing ───────────────────────────────────────────────────
function parseKeys(data: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < data.length) {
    if (data[i] === '\x1b' && data[i + 1] === '[') {
      let j = i + 2;
      while (j < data.length && data.charCodeAt(j) >= 0x30 && data.charCodeAt(j) <= 0x3f) j++;
      while (j < data.length && data.charCodeAt(j) >= 0x20 && data.charCodeAt(j) <= 0x2f) j++;
      if (j < data.length && data.charCodeAt(j) >= 0x40 && data.charCodeAt(j) <= 0x7e) j++;
      tokens.push(data.slice(i, j));
      i = j;
    } else {
      tokens.push(data[i]);
      i++;
    }
  }
  return tokens;
}

// ── Main ──────────────────────────────────────────────────────────
export async function runAnsiPicker(): Promise<void> {
  const prefix = getGlobalOption('@opencode_session_prefix', 'opencode-');
  const parent = getGlobalOption('@opencode_parent', '');

  let sessions = getAllSessions(prefix);
  let query = '';
  let selectedIndex = 0;
  let isSearching = false;

  const filtered = () => {
    const q = query.toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) => s.path.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  };

  const render = () => {
    const list = filtered();
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;

    const listWidth = cols;
    const itemHeight = 3;
    const headerRows = 5;
    const visibleCount = Math.max(1, Math.floor((rows - headerRows) / (itemHeight + 1)));

    if (selectedIndex >= list.length) selectedIndex = Math.max(0, list.length - 1);

    const startIndex = Math.max(
      0,
      Math.min(selectedIndex, Math.max(0, list.length - visibleCount))
    );
    const visible = list.slice(startIndex, startIndex + visibleCount);

    // Clear entire screen
    process.stdout.write('\x1b[2J\x1b[H');

    let row = 1;

    // ── Title ──
    writeLine(row, cols, `  ${fgc(C.blue)}${BOLD}Sessions${RST}`);
    row++;

    // ── Counter / search ──
    if (isSearching) {
      writeLine(row, cols,
        `  ${fgc(C.overlay0)}/${RST}${fgc(C.text)}${query}${fgc(C.blue)}_${RST}`
      );
    } else {
      writeLine(row, cols,
        `  ${fgc(C.overlay2)}${selectedIndex + 1}${fgc(C.overlay0)}/${fgc(C.overlay2)}${list.length}${RST}` +
        (query ? `  ${fgc(C.overlay0)}filter: ${fgc(C.text)}${query}${RST}` : '')
      );
    }
    row++;

    // ── Help ──
    writeLine(row, cols,
      `  ${fgc(C.surface2)}↑↓${RST} ${fgc(C.overlay0)}nav${RST}  ` +
      `${fgc(C.surface2)}/${RST} ${fgc(C.overlay0)}find${RST}  ` +
      `${fgc(C.surface2)}⏎${RST} ${fgc(C.overlay0)}open${RST}  ` +
      `${fgc(C.surface2)}^x${RST} ${fgc(C.overlay0)}kill${RST}  ` +
      `${fgc(C.surface2)}esc${RST} ${fgc(C.overlay0)}quit${RST}`
    );
    row++;

    // ── Divider ──
    writeLine(row, cols, `  ${fgc(C.surface0)}${'─'.repeat(Math.min(listWidth - 4, cols - 4))}${RST}`);
    row++;

    // ── Empty state ──
    if (visible.length === 0) {
      writeLine(row, cols, `  ${fgc(C.overlay0)}no sessions${RST}`);
      return;
    }

    // ── Items ──
    for (let i = 0; i < visible.length; i++) {
      const session = visible[i];
      const isSelected = startIndex + i === selectedIndex;
      row = drawItem(session, listWidth, isSelected, row, cols);
      if (i < visible.length - 1) {
        writeLine(row, cols, ''); // gap
        row++;
      }
    }
  };

  const changeSelection = (delta: number) => {
    const list = filtered();
    const newIndex = Math.max(0, Math.min(list.length - 1, selectedIndex + delta));
    selectedIndex = newIndex;
    const session = list[newIndex];
    if (session) updatePreview(session.name);
    render();
  };

  const activateSession = (session: Session) => {
    const width = getGlobalOption('@opencode_popup_width', '90%');
    const height = getGlobalOption('@opencode_popup_height', '90%');

    const origin = getSessionOption(session.name, '@opencode_origin');
    if (origin && parent) {
      try {
        runTmuxRaw(['switch-client', '-c', parent, '-t', origin]);
      } catch {
        // ignore
      }
    }

    if (parent) {
      Bun.spawn([
        'tmux', 'display-popup',
        '-c', parent,
        '-w', width,
        '-h', height,
        '-E',
        attachCommand(session.name),
      ], { stdio: ['ignore', 'ignore', 'ignore'] });
    }
    runTmuxRaw(['kill-window', '-t', WINDOW_NAME]);
  };

  const killSelected = () => {
    const list = filtered();
    const session = list[selectedIndex];
    if (!session) return;
    killSession(session.name);
    sessions = getAllSessions(prefix);
    if (sessions.length === 0) {
      runTmuxRaw(['kill-window', '-t', WINDOW_NAME]);
      return;
    }
    if (selectedIndex >= sessions.length) selectedIndex = Math.max(0, sessions.length - 1);
    const next = filtered()[selectedIndex];
    if (next) updatePreview(next.name);
    render();
  };

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  hideCursor();

  process.on('SIGWINCH', () => render());

  const snapshot = (list: Session[]): string =>
    list.map((s) => `${s.name}:${s.state}:${s.stateAt}:${s.path}`).join('|');

  // Poll session state so the picker stays live, but only redraw when the
  // session data actually changed (avoids flicker and wasted work).
  let lastSnapshot = snapshot(sessions);
  const refreshInterval = setInterval(() => {
    const next = getAllSessions(prefix);
    const sig = snapshot(next);
    if (sig === lastSnapshot) return;
    lastSnapshot = sig;
    sessions = next;
    render();
  }, 2000);

  const initial = filtered()[selectedIndex];
  if (initial) updatePreview(initial.name);
  render();

  return new Promise((resolve) => {
    const cleanup = () => {
      clearInterval(refreshInterval);
      showCursor();
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeAllListeners('data');
      process.removeAllListeners('SIGWINCH');
      resolve();
    };

    process.stdin.on('data', (chunk: string) => {
      const keys = parseKeys(chunk);
      for (const key of keys) {
        const code = key.charCodeAt(0);

        if (isSearching) {
          if (code === 27) {
            isSearching = false;
            render();
          } else if (code === 13) {
            isSearching = false;
            render();
          } else if (code === 127 || code === 8) {
            query = query.slice(0, -1);
            selectedIndex = 0;
            const s = filtered()[selectedIndex];
            if (s) updatePreview(s.name);
            render();
          } else if (code >= 32 && code <= 126) {
            query += key;
            selectedIndex = 0;
            const s = filtered()[selectedIndex];
            if (s) updatePreview(s.name);
            render();
          }
          continue;
        }

        if (key === '\x1b[A' || key === 'k') {
          changeSelection(-1);
        } else if (key === '\x1b[B' || key === 'j') {
          changeSelection(1);
        } else if (code === 13) {
          const session = filtered()[selectedIndex];
          if (session) {
            cleanup();
            activateSession(session);
            return;
          }
        } else if (key === '/') {
          isSearching = true;
          query = '';
          selectedIndex = 0;
          render();
        } else if (key === '\x18') {
          killSelected();
          if (sessions.length === 0) {
            cleanup();
            return;
          }
        } else if (code === 3) {
          cleanup();
          runTmuxRaw(['kill-window', '-t', WINDOW_NAME]);
          return;
        } else if (key === '\x1b' || key === 'q') {
          cleanup();
          runTmuxRaw(['kill-window', '-t', WINDOW_NAME]);
          return;
        }
      }
    });
  });
}
