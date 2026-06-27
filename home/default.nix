{ pkgs, lib, ... }:

let
  ocmux = pkgs.callPackage ../opencode/tmux-manager/default.nix {};
in

{
  home.username = if pkgs.stdenv.isDarwin then "brettsmith" else "exedev";
  home.homeDirectory = if pkgs.stdenv.isDarwin then "/Users/brettsmith" else "/home/exedev";
  home.stateVersion = "24.05";

  home.sessionPath = lib.optionals pkgs.stdenv.isDarwin [ "/opt/homebrew/bin" ];

  home.sessionVariables = {
    LANG = lib.mkDefault "C.UTF-8";
    LC_ALL = lib.mkDefault "C.UTF-8";
  };

  home.packages = with pkgs; [
    # Dev Languages
    python314
    uv
    go
    nodejs_22
    rustup

    # Content Tools (summarize skill)
    yt-dlp
    poppler-utils
    pandoc

    # CLI Essentials
    ripgrep
    fd
    fzf
    eza
    zoxide
    lazygit
    jq
    neovim
    tmux
    bun
    ocmux
  ] ++ lib.optionals pkgs.stdenv.isDarwin [
    # iOS tooling (macOS only)
    idb-companion
  ];

  programs.zoxide.enable = true;
  programs.zoxide.enableZshIntegration = true;

  programs.fzf = {
    enable = true;
    enableZshIntegration = true;
    changeDirWidgetCommand = "fd --type d --hidden --follow --exclude .git --exclude node_modules --exclude Library --exclude .cache --exclude .npm --exclude .cargo --exclude .rustup --exclude .local/share . $HOME";
    fileWidgetCommand    = "fd --type f --hidden --follow --exclude .git --exclude node_modules --exclude Library --exclude .cache --exclude .npm --exclude .cargo --exclude .rustup --exclude .local/share . $HOME";
    defaultCommand       = "fd --type f --hidden --follow --exclude .git --exclude node_modules --exclude Library --exclude .cache --exclude .npm --exclude .cargo --exclude .rustup --exclude .local/share . $HOME";
  };

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
      export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:$HOME/.opencode/bin:$PATH"
    '' + lib.optionalString pkgs.stdenv.isDarwin ''
      export VAULT_ROOT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/vault"
    '';

    shellAliases = {
      cc = "claude";
      oc = "opencode";
      ll = "eza -l --icons";
      update = if pkgs.stdenv.isDarwin
        then "sudo darwin-rebuild switch --flake ~/.config/nix-config"
        else "nix run home-manager -- switch --flake ~/.config/nix-config#exedev";
      gr = "git stash && git pull --rebase origin main && git stash pop";
    };
  };

  home.activation.linkSkills = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
    mkdir -p "$HOME/.claude"
    mkdir -p "$HOME/.amp"
    mkdir -p "$HOME/.config/opencode"
    ln -sfn "$HOME/.config/nix-config/claude/skills" "$HOME/.claude/skills"
    ln -sfn "$HOME/.config/nix-config/claude/skills" "$HOME/.amp/skills"
    ln -sfn "$HOME/.config/nix-config/claude/skills" "$HOME/.config/opencode/skills"
  '';

  # Cloud images (e.g. exeuntu) ship with bash as the login shell and no
  # password set on the user, so chsh can't authenticate via PAM. Workaround:
  # have bash exec zsh on interactive login. Idempotent.
  home.activation.execZshFromBash = lib.hm.dag.entryAfter [ "writeBoundary" ] (
    lib.optionalString pkgs.stdenv.isLinux ''
      if [ -w "$HOME/.bashrc" ] && ! grep -qF 'exec zsh' "$HOME/.bashrc" 2>/dev/null; then
        cat >> "$HOME/.bashrc" <<'EOF'

# Auto-start zsh on interactive login (managed by home-manager)
[ -n "$PS1" ] && [ -z "$ZSH_VERSION" ] && exec zsh
EOF
      fi
    ''
  );

  # fb-idb (the `idb` CLI) — dependency of ios-simulator-mcp:
  # https://github.com/joshuayoes/ios-simulator-mcp
  # Not in nixpkgs or Homebrew, so install it via uv as an isolated tool.
  # Pinned to Python 3.11 because fb-idb 1.1.7 still uses the
  # removed-in-3.12 `asyncio.get_event_loop()` API.
  # Skipped on Linux — fb-idb is iOS tooling and only useful on macOS.
  home.activation.installFbIdb = lib.hm.dag.entryAfter [ "writeBoundary" ] (
    lib.optionalString pkgs.stdenv.isDarwin ''
      if ! ${pkgs.uv}/bin/uv tool list 2>/dev/null | grep -q '^fb-idb '; then
        $DRY_RUN_CMD ${pkgs.uv}/bin/uv tool install --python 3.11 fb-idb
      fi
    ''
  );

  xdg.configFile."nvim" = {
    source = ../nvim;
    recursive = true;
  };

  xdg.configFile."ghostty" = {
    source = ../ghostty;
    recursive = true;
  };

  # Hammerspoon is macOS-only
  home.file.".hammerspoon" = lib.mkIf pkgs.stdenv.isDarwin {
    source = ../hammerspoon;
    recursive = true;
  };

  home.file.".tmux.conf".source = ../tmux/tmux.conf;

  # OpenCode plugin that reports session state to the tmux session manager.
  xdg.configFile."opencode/plugins/tmux-session-manager.js" = {
    source = "${ocmux}/share/opencode/plugins/tmux-session-manager.js";
  };

  # Point npm global installs at a user-writable prefix so `npm i -g`
  # doesn't try to write into the read-only nix store.
  home.file.".npmrc".text = ''
    prefix=${"\${HOME}"}/.npm-global
  '';
}
