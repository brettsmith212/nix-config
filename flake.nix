{
  description = "Cross-platform nix config: nix-darwin + home-manager for macOS, standalone home-manager for Linux (e.g. exe.dev VMs)";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    nix-darwin.url = "github:LnL7/nix-darwin";
    nix-darwin.inputs.nixpkgs.follows = "nixpkgs";
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nix-darwin, nixpkgs, home-manager, ... }: {
    # macOS: sudo nix run nix-darwin -- switch --flake ~/.config/nix-config
    darwinConfigurations."Bretts-Mac-mini" = nix-darwin.lib.darwinSystem {
      system = "aarch64-darwin";
      modules = [
        ./darwin
        home-manager.darwinModules.home-manager
        {
          home-manager.useGlobalPkgs = true;
          home-manager.useUserPackages = true;
          home-manager.users.brettsmith = import ./home;
        }
      ];
    };

    # Linux (e.g. exe.dev VMs): nix run home-manager -- switch --flake .#exedev
    homeConfigurations.exedev = home-manager.lib.homeManagerConfiguration {
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      modules = [ ./home ];
    };
  };
}
