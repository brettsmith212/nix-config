-- Rex config: tmux-style bindings ported from ../tmux/tmux.conf.
-- Read by the Rex server; apply changes with `rex config reload`.

local prefix = "ctrl+a"
local function bind(key, action, args)
  rex.bind(prefix .. ">" .. key, action, args)
end

-- ctrl+a twice sends a literal ctrl+a (tmux send-prefix)
bind("ctrl+a", "pane.send_key", { key = "ctrl+a" })

-- splits
bind("\\", "pane.split", { direction = "right" })
bind("-", "pane.split", { direction = "down" })

-- reload config
bind("r", "client.config.reload")

-- vim-like pane switching
bind("h", "pane.focus", { direction = "left" })
bind("j", "pane.focus", { direction = "down" })
bind("k", "pane.focus", { direction = "up" })
bind("l", "pane.focus", { direction = "right" })

-- resize panes
bind("ctrl+h", "pane.resize", { direction = "left" })
bind("ctrl+j", "pane.resize", { direction = "down" })
bind("ctrl+k", "pane.resize", { direction = "up" })
bind("ctrl+l", "pane.resize", { direction = "right" })

-- zoom
bind("m", "pane.zoom")
bind("z", "pane.zoom")

-- Close the focused pane, or its tab when it's the last pane (tmux kill-pane).
-- pane.close alone won't close a tab's last pane.
rex.action{
  name  = "close_pane_or_tab",
  title = "Close Pane or Tab",
  run   = function(ctx, args)
    local view, err = rex.session.view{}
    if err ~= nil then error(err, 0) end
    for _, w in ipairs(view.windows) do
      local count, here = 0, false
      for _, layer in ipairs(w.layers) do
        for _, b in ipairs(layer.blocks) do
          count = count + 1
          if b.block_id == ctx.block_id then here = true end
        end
      end
      if here then
        rex.client.queue(count == 1 and "client.tab.close" or "pane.close")
        return
      end
    end
    rex.client.queue("pane.close")
  end,
}

-- Lazygit over the current tab, in the focused pane's directory (tmux
-- display-popup). Opens as a zoomed split, so it fills the tab; quitting
-- lazygit closes the pane and restores the layout. Floating layers would fit
-- better but render transparent and clip offset bounds in this Rex beta.
rex.action{
  name  = "lazygit_popup",
  title = "Lazygit Popup",
  run   = function(ctx, args)
    local proc = rex.block.call("com.superlogical.terminal", "process", { block_id = ctx.block_id })
    local cwd = proc and proc.foreground and proc.foreground.cwd or (proc and proc.home)
    local res, err = rex.session.new_split{
      anchor_block_id = ctx.block_id,
      direction = "horizontal",
      side      = "after",
      focus     = true,
      layout    = rex.layout.block{
        flavor  = "com.superlogical.terminal.shell",
        options = { cwd = cwd, command = { "env", "EDITOR=nvim", "lazygit" } },
      },
    }
    if err ~= nil then error(err, 0) end
    local _, zerr = rex.session.zoom_block{ block_id = res.block_ids[1], zoom = true }
    if zerr ~= nil then error(zerr, 0) end
  end,
}

-- tab (tmux window) management
bind("c", "client.tab.new")
bind("n", "client.tab.next")
bind("p", "client.tab.previous")
bind("x", "close_pane_or_tab")
bind(",", "client.tab.rename")
bind("g", "lazygit_popup")
bind("shift+,", "client.tab.move.backward") -- <
bind("shift+.", "client.tab.move.forward")  -- >
