#!/bin/sh
DIR="$1"
SESSION="opencode-$(echo "$DIR" | (md5sum 2>/dev/null || md5 -q) | cut -c1-8)"
tmux has-session -t "$SESSION" 2>/dev/null ||
  tmux new-session -d -s "$SESSION" -c "$DIR" "opencode"
tmux display-popup -w90% -h90% -E "tmux attach-session -t $SESSION"
