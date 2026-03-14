{ pkgs, ... }: {
  home.username = "brettsmith";
  home.homeDirectory = "/Users/brettsmith";

  home.packages = with pkgs; [
    # Dev Languages
    python314        # Latest Python
    uv               # Fast Python package manager
    go               # Go
    nodejs_22        # Node.js
    rustup           # Rust
    
    # AI Tools (installed via npm for self-update support)
    # claude-code and amp-cli managed via: npm install -g @anthropic-ai/claude-code @sourcegraph/amp
    
    # CLI Essentials
    ripgrep          # Faster grep
    fd               # Faster find
    fzf              # Fuzzy finder
    eza              # Better 'ls'
    zoxide           # Better 'cd'
    lazygit          # Git TUI
    jq               # JSON processor
    neovim           # Neovim
  ];

  programs.zoxide.enable = true;
  programs.zoxide.enableZshIntegration = true;

  programs.starship = {
    enable = true;
    enableZshIntegration = true;
    settings = {
      format = "$directory$git_branch$git_status$golang$python$nodejs$rust$cmd_duration$line_break$character";
      directory = {
        style = "bold cyan";
        truncation_length = 3;
        truncation_symbol = "…/";
      };
      git_branch = {
        style = "bold purple";
        symbol = " ";
      };
      git_status = {
        style = "bold red";
      };
      golang = {
        symbol = " ";
        style = "bold cyan";
      };
      python = {
        symbol = " ";
        style = "bold yellow";
      };
      nodejs = {
        symbol = " ";
        style = "bold green";
      };
      rust = {
        symbol = " ";
        style = "bold red";
      };
      cmd_duration = {
        min_time = 2000;
        style = "bold yellow";
        show_milliseconds = false;
      };
      character = {
        success_symbol = "[❯](bold green)";
        error_symbol = "[❯](bold red)";
      };
    };
  };

  programs.zsh = {
    enable = true;
    enableCompletion = true;
    autosuggestion.enable = true;
    syntaxHighlighting.enable = true;

    # Changed from initExtra to initContent or just envExtra
    envExtra = ''
      export PATH="$HOME/.local/bin:$PATH"
    '';

    shellAliases = {
      ll = "eza -l --icons";
      update = "sudo darwin-rebuild switch --flake ~/.config/nix-config";
    };
  };

  xdg.configFile."nvim" = {
    source = ./nvim;
    recursive = true;
  };

  xdg.configFile."ghostty" = {
    source = ./ghostty;
    recursive = true;
  };

  home.stateVersion = "24.05";
}
