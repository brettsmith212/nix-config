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

  xdg.configFile."ghostty/config".text = ''
    theme = Everforest Dark Hard
    font-size = 16
    font-family = "TX-02"
    shell-integration-features = no-cursor,sudo,no-title
    cursor-style = block
    adjust-cell-height = 25%
    confirm-close-surface = false

    mouse-hide-while-typing = true
    mouse-scroll-multiplier = 2

    window-save-state = always
    macos-titlebar-style = transparent

    copy-on-select = clipboard

    # Titlebar stuff (using on linux)
    gtk-titlebar = false
    gtk-wide-tabs = false
    gtk-tabs-location = top

    # replicate tmux
    keybind = ctrl+a>-=new_split:down
    keybind = ctrl+a>\=new_split:right
    keybind = ctrl+a>c=new_tab
    keybind = ctrl+a>n=next_tab
    keybind = ctrl+a>p=previous_tab
    keybind = ctrl+a>,=prompt_surface_title

    keybind = ctrl+a>r=reload_config
    keybind = ctrl+a>x=close_surface

    # resize split pane (with prefix, like tmux)
    keybind = ctrl+a>ctrl+j=resize_split:down,25
    keybind = ctrl+a>ctrl+k=resize_split:up,25
    keybind = ctrl+a>ctrl+h=resize_split:left,25
    keybind = ctrl+a>ctrl+l=resize_split:right,25

    # move cursor
    keybind = ctrl+a>j=goto_split:bottom
    keybind = ctrl+a>k=goto_split:top
    keybind = ctrl+a>h=goto_split:left
    keybind = ctrl+a>l=goto_split:right

    # quick tab switch
    keybind = ctrl+a>1=goto_tab:1
    keybind = ctrl+a>2=goto_tab:2
    keybind = ctrl+a>3=goto_tab:3
    keybind = ctrl+a>4=goto_tab:4
    keybind = ctrl+a>5=goto_tab:5
    keybind = ctrl+a>6=goto_tab:6
  '';

  home.stateVersion = "24.05";
}
