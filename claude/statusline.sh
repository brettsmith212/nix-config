#!/usr/bin/env bash
# Claude Code status line: model · effort · context · 5h/7d usage.
# Claude Code pipes session JSON on stdin; the first line of stdout is shown.

input=$(cat)
[ -n "$CLAUDE_STATUSLINE_DEBUG" ] && printf '%s' "$input" > "${TMPDIR:-/tmp}/claude-statusline.json"

settings="$HOME/.claude/settings.json"
[ -f "$settings" ] || settings=/dev/null

jq -rj --slurpfile s "$settings" '
  def c(code): "\u001b[" + code + "m";
  def reset: c("0");
  def dim(t): c("2") + t + reset;
  # green < 50%, yellow < 80%, red otherwise
  def pct(p): (p | floor) as $n
    | (if $n >= 80 then "31" elif $n >= 50 then "33" else "32" end) as $col
    | c($col) + ($n | tostring) + "%" + reset;
  def until_reset(t):
    if t == null then ""
    else ((t | if type == "string" then (sub("\\.[0-9]+"; "") | fromdateiso8601) else . end) - now) as $d
      | if $d <= 0 then ""
        elif $d >= 86400 then dim(" " + (($d / 86400) | floor | tostring) + "d")
        elif $d >= 3600 then dim(" " + (($d / 3600) | floor | tostring) + "h" + ((($d % 3600) / 60) | floor | tostring) + "m")
        else dim(" " + (($d / 60) | floor | tostring) + "m") end
    end;

  ($s[0] // {}) as $cfg
  | (.model.id // "") as $id
  | (.effort.level? // .effort_level? // (.effort | strings)
      // $cfg.modelSettings[$id].effortLevel? // $cfg.effortLevel? // null) as $effort
  | [
      c("1;36") + (.model.display_name // $id // "claude") + reset,
      (if $effort then c("35") + $effort + reset else empty end),
      (.context_window.used_percentage // null
        | if . then dim("ctx ") + pct(.) else empty end),
      (.rate_limits.five_hour // null
        | if .used_percentage then dim("5h ") + pct(.used_percentage) + until_reset(.resets_at) else empty end),
      (.rate_limits.seven_day // null
        | if .used_percentage then dim("7d ") + pct(.used_percentage) + until_reset(.resets_at) else empty end)
    ]
  | join(dim(" · "))
' <<<"$input"
