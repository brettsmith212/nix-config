# Agent Notes

This repo is a Nix-managed macOS/Linux home configuration

## Changing the LLM agent in tmux

Edit `tmux/tmux.conf`:

```tmux
set -g @llm_command 'opencode'
```

Change the value to any agent CLI available in `PATH`. For Claude Code:

```tmux
set -g @llm_command 'claude'
```

Then reload tmux:

```bash
tmux source-file ~/.tmux.conf
```

or use the existing binding `Ctrl+a r`.

## Key bindings

- `Ctrl+a y` — toggle the LLM popup for the current directory
- `Ctrl+a u` — open the session picker

## Architecture

- `opencode/llmux-plugin/` — OpenCode plugin shim (JS)
- The `llmux` binary and the Claude Code plugin live in a separate repo:
  [`github:brettsmith212/llm-session-manager`](https://github.com/brettsmith212/llm-session-manager),
  consumed as a flake input in `flake.nix` (`inputs.llmux`).

State is stored on tmux sessions (`@llm_state`, `@llm_state_at`, etc.) and read by the picker.
