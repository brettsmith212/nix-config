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
    
    # AI Tools
    claude-code      # Anthropic's CLI
    amp-cli          # Sourcegraph's Amp agent
    
    # CLI Essentials
    ripgrep          # Faster grep
    fd               # Faster find
    fzf              # Fuzzy finder
    eza              # Better 'ls'
    zoxide           # Better 'cd'
    lazygit          # Git TUI
    jq               # JSON processor
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
      update = "darwin-rebuild switch --flake ~/nix-config"; # Adjust path to where your flake is
    };
  };

  home.stateVersion = "24.05";
}
