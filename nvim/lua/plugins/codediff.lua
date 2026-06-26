-- VSCode-style two-tier diff highlighting (line + character level),
-- side-by-side or inline layouts, async git operations, C-based diff engine.
--
-- Note: lives alongside diffview.nvim (mapped to <leader>gv/gf/gF/gc) as a
-- more modern alternative with better character-level highlighting.
--
-- Common commands:
--   :CodeDiff                       -- git status explorer (unstaged + staged)
--   :CodeDiff HEAD~5                -- changes in last 5 commits
--   :CodeDiff main                  -- current vs main
--   :CodeDiff main...HEAD           -- PR-style (merge-base) diff, committed only
--   :CodeDiff main...               -- merge-base vs working tree (incl. uncommitted)
--   :CodeDiff file HEAD             -- current buffer vs HEAD
--   :CodeDiff file abc123           -- current buffer vs a specific commit
--   :CodeDiff history               -- per-commit review (all files)
--   :CodeDiff history %             -- per-commit review (current file)
--   :CodeDiff file a.lua b.lua      -- compare two arbitrary files
--   :CodeDiff dir ~/v1 ~/v2         -- compare two directories
--
-- In-view keymaps (defaults; see plugin README for full list):
--   ]c / [c    next/prev hunk
--   ]f / [f    next/prev file
--   do / dp    diffget / diffput
--   t          toggle side-by-side <-> inline
--   gc         toggle compact (fold unchanged regions)
--   q          close diff tab
--
-- The C library auto-downloads on first use; no build step required.
-- Manual install/update: :CodeDiff install   (force: :CodeDiff install!)

return {
  {
    "esmuellert/codediff.nvim",
    cmd = "CodeDiff",
    event = "VeryLazy",
    keys = {
      { "<leader>cd", "<cmd>CodeDiff<cr>",                                desc = "CodeDiff: git status" },
      { "<leader>ch", "<cmd>CodeDiff history %<cr>",                      desc = "CodeDiff: file history" },
      { "<leader>cH", "<cmd>CodeDiff history<cr>",                        desc = "CodeDiff: repo history" },
      { "<leader>cP", "<cmd>CodeDiff main...HEAD<cr>",                    desc = "CodeDiff: PR-style vs main" },
      { "<leader>cp", "<cmd>CodeDiff main...<cr>",                       desc = "CodeDiff: vs main (incl. uncommitted)" },
    },
    opts = {
      diff = {
        layout = "side-by-side",
        disable_inlay_hints = true,
      },
    },
  },
}
