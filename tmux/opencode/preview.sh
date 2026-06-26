#!/usr/bin/env bash

# Preview a tmux session's active pane for the fzf picker.
# Args: <session-name>

session="${1:-}"
[ -z "$session" ] && exit 0

# Capture roughly the visible screen so the preview doesn't include the
# entire scrollback buffer. Cap it so empty pane space doesn't show as blanks.
height=$(tmux display-message -p -t "$session" '#{pane_height}' 2>/dev/null) || height=30
[ -z "$height" ] || [ "$height" -lt 1 ] && height=30
max=40
[ "$height" -gt "$max" ] && height=$max

# -e  preserve colors (fzf --ansi will render them)
# -p  print to stdout
# -S -N  start N lines back from the bottom
# sed trims trailing whitespace; awk drops trailing blank lines so empty pane
# space at the bottom doesn't show up as blank areas in the preview.
tmux capture-pane -ept "$session" -S "-$height" 2>/dev/null \
  | sed 's/[[:space:]]*$//' \
  | awk '{lines[NR]=$0} END {last=NR; while(last>0 && lines[last] ~ /^[[:space:]]*$/) last--; for(i=1;i<=last;i++) print lines[i]}'
