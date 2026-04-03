return {
  "dmtrKovalenko/fff.nvim",
  build = function()
    require("fff.download").download_or_build_binary()
  end,
  opts = {
    layout = {
      width = 0.9,
      height = 0.85,
      preview_position = "right",
      preview_size = 0.55,
    },
  },
  lazy = false,
  keys = {
    {
      "<leader>ff",
      function() require("fff").find_files() end,
      desc = "Find files (fff)",
    },
    {
      "<leader><leader>",
      function() require("fff").find_files() end,
      desc = "Find files (fff)",
    },
    {
      "<leader>sg",
      function() require("fff").live_grep() end,
      desc = "Live grep (fff)",
    },
    {
      "<leader>sz",
      function()
        require("fff").live_grep({
          grep = {
            modes = { "fuzzy", "plain" },
          },
        })
      end,
      desc = "Fuzzy grep (fff)",
    },
    {
      "<leader>sw",
      function() require("fff").live_grep({ query = vim.fn.expand("<cword>") }) end,
      desc = "Search current word (fff)",
    },
  },
}
