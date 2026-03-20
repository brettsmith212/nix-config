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

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```

### 7. Post-Setup (Manual Steps)

- **Create 5 desktops** in Mission Control for the Cmd+1 through Cmd+5 keyboard shortcuts to work.
- **Install global npm tools:**
  ```sh
  npm install -g @anthropic-ai/claude-code @sourcegraph/amp
  ```

## Apply Changes

After editing any config files, rebuild with:

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```
