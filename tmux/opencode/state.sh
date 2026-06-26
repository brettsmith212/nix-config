#!/usr/bin/env bash

# Record an opencode session's state on its tmux session, for the picker.
# Wire into opencode hooks (if available): state.sh <working|waiting|idle>
# When opencode runs inside tmux, $TMUX_PANE is set. Outside tmux this is a no-op.

[ -z "$TMUX_PANE" ] && exit 0

session=$(tmux display-message -p -t "$TMUX_PANE" '#{session_name}' 2>/dev/null) || exit 0
[ -z "$session" ] && exit 0

tmux set-option -t "$session" @opencode_state "${1:-idle}"
tmux set-option -t "$session" @opencode_state_at "$(date +%s)"

exit 0
