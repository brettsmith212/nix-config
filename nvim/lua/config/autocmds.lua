vim.opt.autoread = true

vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter", "TermClose", "WinEnter", "TabEnter" }, {
  desc = "Reload file if changed on disk when returning to Neovim or switching windows",
  command = "checktime",
})

-- Optional: notify when reload happens
vim.api.nvim_create_autocmd("FileChangedShellPost", {
  callback = function(ev)
    vim.notify(("Reloaded: %s"):format(vim.fn.fnamemodify(ev.file, ":.")), vim.log.levels.WARN)
  end,
})
