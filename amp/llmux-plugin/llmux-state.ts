/**
 * Amp plugin that tracks thread state (working/idle/waiting) on the tmux
 * session, for display in the llmux picker.
 *
 * Analogous to the OpenCode llmux plugin. Amp exposes a per-thread
 * `ThreadState` observable ('idle' | 'running' | 'awaiting-approval' |
 * 'error'); we subscribe to each thread's state stream and translate it
 * into `llmux state <working|waiting|idle>` calls.
 *
 * State mapping:
 *   running            -> working   (red, busy)
 *   awaiting-approval  -> waiting   (yellow, needs input)
 *   idle / error       -> idle      (green, done)
 *
 * The plugin process is long-lived and may host several threads (the main
 * interactive thread plus any background threads created by other plugins
 * via amp.createAgent). We aggregate across all of them, matching the
 * OpenCode plugin's semantics: waiting if any is waiting, else working if
 * any is running, else idle.
 *
 * `llmux state` resolves the tmux session from $TMUX_PANE, which Amp
 * inherits from the tmux session it was launched in. We use `amp.$`
 * (top-level Bun shell, not tied to a handler invocation) so shell calls
 * remain valid inside the long-lived observable callback.
 */
import type { PluginAPI, ThreadID, ThreadState } from '@ampcode/plugin'

type LlmuxState = 'working' | 'waiting' | 'idle'

const threadStates = new Map<ThreadID, ThreadState>()
const subscribed = new Set<ThreadID>()
let lastPublished: LlmuxState | null = null

function aggregate(): LlmuxState {
  let working = false
  let waiting = false
  for (const s of threadStates.values()) {
    if (s === 'awaiting-approval') waiting = true
    else if (s === 'running') working = true
  }
  if (waiting) return 'waiting'
  if (working) return 'working'
  return 'idle'
}

async function publish(amp: PluginAPI): Promise<void> {
  const next = aggregate()
  if (next === lastPublished) return
  lastPublished = next
  try {
    await amp.$`llmux state ${next}`
  } catch {
    // state updates are best-effort; never interrupt the agent
  }
}

export default function (amp: PluginAPI) {
  amp.on('session.start', async (_event, ctx) => {
    const thread = ctx.thread
    if (subscribed.has(thread.id)) return
    subscribed.add(thread.id)

    // Seed with the current state, then stream transitions.
    try {
      const current = await thread.state.get()
      threadStates.set(thread.id, current)
      await publish(amp)
    } catch {
      // best-effort
    }

    thread.state.subscribe(async (state: ThreadState) => {
      threadStates.set(thread.id, state)
      await publish(amp)
    })
  })
}
