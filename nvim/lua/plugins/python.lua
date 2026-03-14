return {
  -- LSP: ty (Astral's type checker)
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        ty = {
          settings = {
            ty = {
              diagnosticMode = "openFilesOnly",
            },
          },
        },
        ruff = {
          init_options = {
            settings = {
              organizeImports = true,
            },
          },
        },
      },
    },
  },

  -- Ensure tools are installed via Mason
  {
    "mason-org/mason.nvim",
    opts = function(_, opts)
      opts.ensure_installed = opts.ensure_installed or {}
      vim.list_extend(opts.ensure_installed, {
        "ty",
        "ruff",
      })
    end,
  },

  -- Treesitter
  {
    "nvim-treesitter/nvim-treesitter",
    opts = {
      ensure_installed = { "python" },
    },
  },

  -- Formatting with conform.nvim using ruff
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        python = { "ruff_format", "ruff_organize_imports" },
      },
    },
  },
}
