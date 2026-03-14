# nix-config

Nix Darwin + Home Manager configuration for macOS.

## First-Time Setup

### 1. Install Nix

Install Nix using the [Determinate Systems](https://determinate.systems/) installer:

```sh
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

### 2. Clone This Repo

```sh
git clone https://github.com/brettsmith212/nix-config.git ~/.config/nix-config
```

### 3. Apply the Configuration

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```

> **Note:** The flake expects the hostname `Bretts-MacBook`. If your hostname differs, update the key in `flake.nix` or rename your machine.

## Apply Changes

After editing any config files, rebuild with:

```sh
sudo darwin-rebuild switch --flake ~/.config/nix-config
```
