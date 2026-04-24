# nix-config

Nix Darwin + Home Manager configuration for macOS.

## First-Time Setup

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

### 5. Set Your Hostname in `flake.nix`

Update the `hostname` variable at the top of `flake.nix` to match your machine:

```sh
scutil --get LocalHostName
```

Then edit `flake.nix` and set `hostname = "YourHostnameHere";`.

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

After editing any config files, rebuild with:

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```
