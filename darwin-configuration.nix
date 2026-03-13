{ pkgs, ... }: {
  programs.zsh.enable = true;
  system.primaryUser = "brettsmith";
  nix.settings.trusted-users = [ "root" "brettsmith" ];
  nix.enable = false;

  users.users.brettsmith = {
    name = "brettsmith";
    home = "/Users/brettsmith";
  };

  homebrew = {
    enable = true;
    onActivation.cleanup = "zap";
    onActivation.autoUpdate = true;
    onActivation.upgrade = true;

    casks = [
      "ghostty"
    ];
  };

  system.stateVersion = 5;
}
