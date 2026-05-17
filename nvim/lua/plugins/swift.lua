return {
  -- LSP: sourcekit-lsp (ships with Xcode toolchain; not managed by Mason)
  --
  -- For SwiftPM projects this works out of the box.
  -- For Xcode projects (.xcodeproj / .xcworkspace), generate a buildServer.json
  -- so sourcekit-lsp can resolve UIKit/SwiftUI/etc:
  --
  --   xcode-build-server config -scheme <Scheme> -project <App>.xcodeproj
  --
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        sourcekit = {},
      },
    },
  },

  -- Treesitter
  {
    "nvim-treesitter/nvim-treesitter",
    opts = {
      ensure_installed = { "swift" },
    },
  },

  -- Formatting with conform.nvim using Apple's swift-format
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        swift = { "swift_format" },
      },
    },
  },
}
