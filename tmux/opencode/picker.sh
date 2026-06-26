#!/usr/bin/env bash

# Interactive fzf picker for running opencode sessions.
# On enter: switches the parent client to the chosen session's origin window
# and resumes it in the popup.
# With --list: prints rows only (used by fzf's ctrl-x reload).

set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$DIR/helpers.sh"

prefix="$(get_tmux_option @opencode_session_prefix 'opencode-')"

emit_rows() {
  local now s state at path icon rank ago
  now=$(date +%s)

  tmux list-sessions -F '#{session_name}' 2>/dev/null | grep "^${prefix}" | while IFS= read -r s; do
    state=$(tmux show-options -qv -t "$s" @opencode_state 2>/dev/null)
    at=$(tmux show-options -qv -t "$s" @opencode_state_at 2>/dev/null)
    path=$(tmux display-message -p -t "$s" '#{pane_current_path}' 2>/dev/null)

    case "$state" in
      waiting) icon=$'\033[33m●\033[0m waiting' rank=0 ;;  # yellow - needs input
      idle)    icon=$'\033[32m●\033[0m idle   ' rank=1 ;;  # green  - done
      working) icon=$'\033[31m●\033[0m working' rank=3 ;;  # red    - busy
      *)       icon=$'\033[90m●\033[0m ?      ' rank=2 ;;  # grey   - unknown
    esac

    if [ -n "$at" ]; then ago="$(((now - at) / 60))m"; else ago='-'; fi

    printf '%s\t%s\t%s\t%5s\t%s\n' "$rank" "$s" "$icon" "$ago" "${path/#$HOME/~}"
  done | sort -t$'\t' -k1,1n -k4,4n
}

[ "${1:-}" = '--list' ] && { emit_rows; exit 0; }

if ! command -v fzf >/dev/null 2>&1; then
  tmux display-message "tmux-opencode: fzf is required for the picker"
  exit 0
fi

self="${BASH_SOURCE[0]}"
export FZF_DEFAULT_OPTS=''

sel=$(emit_rows | fzf --ansi --delimiter=$'\t' --with-nth=3,4,5 \
  --reverse --cycle --header='opencode sessions · enter: jump · ctrl-x: kill' \
  --preview="$DIR/preview.sh {2}" --preview-window='right,62%,nowrap,border-left' \
  --preview-label='pane' \
  --bind="ctrl-x:execute-silent(tmux kill-session -t {2})+reload($self --list)")

[ -z "$sel" ] && exit 0

target=$(printf '%s' "$sel" | cut -f2)

origin=$(tmux show-options -qv -t "$target" @opencode_origin 2>/dev/null)
parent=$(tmux show-options -gqv @opencode_parent 2>/dev/null)

[ -n "$origin" ] && [ -n "$parent" ] &&
  tmux switch-client -c "$parent" -t "$origin" 2>/dev/null

tmux attach-session -t "$target"
