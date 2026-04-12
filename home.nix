{ pkgs, lib, ... }: {
  home.username = "brettsmith";
  home.homeDirectory = "/Users/brettsmith";
  home.sessionPath = [ "/opt/homebrew/bin" ];

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
      format = "$username$hostname$directory$git_branch$git_status$golang$python$nodejs$rust$cmd_duration$line_break$character";
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
      username = {
        show_always = false;
        style_user = "bold yellow";
        format = "[$user]($style)@";
      };
      hostname = {
        ssh_only = true;
        style = "bold yellow";
        format = "[$hostname]($style) ";
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

    initContent = ''
      if [[ -n "$SSH_CONNECTION" ]]; then
        _zsh_autosuggest_disable
      fi
    '';

    envExtra = ''
      export PATH="$HOME/.local/bin:$PATH"
      export VAULT_ROOT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/HomeVault"
    '';

    shellAliases = {
      cc = "claude";
      ll = "eza -l --icons";
      update = "sudo darwin-rebuild switch --flake ~/.config/nix-config";
    };
  };

  home.activation.linkSkills = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
    mkdir -p "$HOME/.claude"
    mkdir -p "$HOME/.amp"
    ln -sfn "$HOME/.config/nix-config/claude/skills" "$HOME/.claude/skills"
    ln -sfn "$HOME/.config/nix-config/claude/skills" "$HOME/.amp/skills"
  '';

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
