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
