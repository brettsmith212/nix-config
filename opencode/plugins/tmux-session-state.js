// OpenCode plugin to drive tmux-opencode-session-manager state dots.
// Drops into ~/.config/opencode/plugins/ and calls the tmux state helper
// whenever the agent starts/stops working.

const STATE_SCRIPT = `${process.env.HOME}/.tmux/opencode/state.sh`;

const setState = async ($, state) => {
  try {
    await $`bash ${STATE_SCRIPT} ${state}`;
  } catch {
    // state.sh is a no-op outside tmux; ignore failures so the plugin never
    // interrupts the agent if the helper is missing or tmux is unreachable.
  }
};

const mapStatus = (statusType) => {
  if (typeof statusType !== 'string') return null;
  const s = statusType.toLowerCase();
  if (s === 'busy') return 'working';
  if (s === 'idle') return 'idle';
  return null;
};

export const TmuxSessionState = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event?.type !== 'session.status') return;
      const mapped = mapStatus(event?.properties?.status?.type);
      if (mapped) await setState($, mapped);
    },
  };
};
