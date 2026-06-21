-- PR review workflow:
--   1. Open a review worktree with the PR branch checked out
--   2. :DiffviewOpen origin/main...HEAD   -- all files changed in the PR
--   3. Navigate file panel with j/k, open with Enter (side-by-side: old left, new right)
--   4. LSP works on the right (new) side -- gd, K, gr all work
--   5. ]c / [c to jump between hunks within a file
--   6. :DiffviewClose (or <leader>gc) when done
--
-- Other useful commands:
--   :DiffviewOpen abc123^!          -- exact changes introduced by one commit
--   :DiffviewFileHistory            -- all commits in the branch
--   :DiffviewFileHistory %          -- commits that touched the current file
--   :'<,'>DiffviewFileHistory       -- history for a visual selection
--
-- Keymaps (from any buffer):
--   <leader>gv  -- open PR diff vs main
--   <leader>gf  -- file history for current file
--   <leader>gF  -- repo commit history (all files)
--   <leader>gc  -- close diffview

return {
  {
    "sindrets/diffview.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    cmd = { "DiffviewOpen", "DiffviewClose", "DiffviewFileHistory" },
    keys = {
      { "<leader>gv", "<cmd>DiffviewOpen origin/main...HEAD<cr>", desc = "Diff PR vs main" },
      { "<leader>gf", "<cmd>DiffviewFileHistory %<cr>", desc = "File history" },
      { "<leader>gF", "<cmd>DiffviewFileHistory<cr>", desc = "Repo history" },
      { "<leader>gc", "<cmd>DiffviewClose<cr>", desc = "Close diffview" },
    },
    opts = function()
      local actions = require("diffview.actions")
      return {
        keymaps = {
          view = {
            { "n", "e",         actions.goto_file_tab,  { desc = "Open file in new tabpage" } },
            { "n", "<leader>e", actions.toggle_files,   { desc = "Toggle file panel" } },
          },
          file_panel = {
            { "n", "e",         actions.goto_file_tab,  { desc = "Open file in new tabpage" } },
            { "n", "<leader>e", actions.toggle_files,   { desc = "Toggle file panel" } },
          },
          file_history_panel = {
            { "n", "e",         actions.goto_file_tab,  { desc = "Open file in new tabpage" } },
            { "n", "<leader>e", actions.toggle_files,   { desc = "Toggle file panel" } },
          },
        },
        hooks = {
          diff_buf_win_enter = function(bufnr, winid, ctx)
            vim.wo[winid].wrap = true
          end,
        },
      }
    end,
  },
}
