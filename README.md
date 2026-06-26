# nix-config

Cross-platform Nix configuration: nix-darwin + Home Manager for macOS,
and a standalone Home Manager for Linux (e.g. exe.dev VMs).

## Layout

- `flake.nix` — dual outputs: `darwinConfigurations.<hostname>` (macOS) and `homeConfigurations.exedev` (Linux). `darwin-rebuild` automatically picks the macOS output whose name matches `scutil --get LocalHostName`, so you can add multiple Macs to the `darwinHosts` list.
- `darwin/` — nix-darwin system module (Homebrew casks, system defaults, dockutil, etc.). macOS only.
- `home/` — cross-platform Home Manager config. Branches on `pkgs.stdenv.isDarwin` for username, `VAULT_ROOT`, the `update` alias, and macOS-only files (Hammerspoon).
- `nvim/`, `tmux/`, `ghostty/`, `claude/`, `hammerspoon/`, `opencode/` — dotfile trees or individual config files symlinked into `$HOME` or `$XDG_CONFIG_HOME`.

## First-Time Setup (macOS)

### 1. Install Xcode Command Line Tools

Required for `git` and other build tools:

```sh
xcode-select --install
```

### 2. Install Nix

Install Nix using the [Determinate Systems](https://determinate.systems/) installer:

```sh
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

### 3. Install Homebrew

nix-darwin manages Homebrew packages but expects Homebrew to already be installed:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 4. Clone This Repo

```sh
git clone https://github.com/brettsmith212/nix-config.git ~/.config/nix-config
```

### 5. Add Your Mac to `flake.narwinHosts`

Find your machine's hostname:

```sh
scutil --get LocalHostName
```

Then edit `flake.nix` and add it to the `darwinHosts` list if it isn't already there:

```nix
  darwinHosts = [ "Bretts-Mac-mini" "Your-Other-Mac" ];
```

### 6. Apply the Configuration

Before running, grant Ghostty (or your terminal) Full Disk Access so nix-darwin can write to system preference domains like `com.apple.universalaccess`:

- Open **System Settings → Privacy & Security → Full Disk Access**
- Click **+** and add **Ghostty** (or your terminal app)

Then apply the configuration:

```sh
sudo nix run nix-darwin -- switch --flake ~/.config/nix-config
```

### 7. Configure Desktop Switching Shortcuts

- Create **5 desktops** in Mission Control
- Open **System Settings → Keyboard → Keyboard Shortcuts → Mission Control**
- Expand the **Mission Control** section
- Check all **Switch to Desktop _n_** boxes (should be 5 from creating them above)
- You can now switch between desktops with `Ctrl+1`, `Ctrl+2`, etc.
- To use `Cmd+1`, `Cmd+2`, etc. instead: double-click each `^ + 1` shortcut and record `Cmd+1` (and so on for 2–5)

### 8. Post-Setup (Manual Steps)

- **Install global npm tools:**
  ```sh
  curl -fsSL https://ampcode.com/install.sh | bash
  ```

### 9. Install tailscale

[Tailscale MacOS Package](https://pkgs.tailscale.com/stable/#macos)

## Apply Changes

### macOS

After editing any config files, rebuild with:

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```

### Linux (exe.dev and friends)

The Linux build targets the `exedev` user on `x86_64-linux` (the default exeuntu image on [exe.dev](https://exe.dev)).

1. Install Nix using the [Determinate Systems](https://determinate.systems/) installer:
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
   ```
2. Clone this repo into the expected path (so the `linkSkills` activation finds it):
   ```sh
   git clone https://github.com/brettsmith212/nix-config.git ~/.config/nix-config
   ```
3. Apply:
   ```sh
   nix run home-manager -- switch --flake ~/.config/nix-config#exedev
   ```

After that, `update` is aliased to `home-manager switch --flake ~/.config/nix-config`.

## Platform branching

`home/default.nix` is the same file for both macOS and Linux. It branches on `pkgs.stdenv.isDarwin` to handle:

| Setting | macOS | Linux |
| --- | --- | --- |
| `home.username` | `brettsmith` | `exedev` |
| `home.homeDirectory` | `/Users/brettsmith` | `/home/exedev` |
| `home.sessionPath` | includes `/opt/homebrew/bin` | (none) |
| `VAULT_ROOT` | iCloud Obsidian path | (unset) |
| `update` alias | `sudo darwin-rebuild switch ...` | `home-manager switch ...` |
| `~/.hammerspoon` | symlinked | skipped (`null`) |
| `installFbIdb` activation | runs | skipped (iOS tooling) |

Everything else (nvim, tmux, ghostty, fzf, starship, zoxide, packages, the linkSkills symlinks, the `.npmrc`) is identical on both platforms.
