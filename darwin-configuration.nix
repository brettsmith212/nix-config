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

    brews = [
      "dockutil"
    ];

    casks = [
      "ghostty"
      "hammerspoon"
      "obsidian"
      "zoom"
    ];
  };

  # Remap Caps Lock to Control
  system.keyboard = {
    enableKeyMapping = true;
    remapCapsLockToControl = true;
  };

  system.defaults = {
    # Disable auto-rearrange Spaces based on most recent use
    dock.mru-spaces = false;

    # Disable show suggested and recent apps in Dock
    dock.show-recents = false;

    # Reduce motion (instant desktop transitions)
    universalaccess.reduceMotion = true;

    # Show battery percentage in menu bar
    controlcenter.BatteryShowPercentage = true;

    # Show Bluetooth in menu bar (18 = show in menu bar)
    controlcenter.Bluetooth = true;

    # Show Sound/Volume in menu bar (18 = always show)
    controlcenter.Sound = true;

    CustomUserPreferences = {
      # Click wallpaper to show desktop: Only in Stage Manager
      "com.apple.WindowManager" = {
        EnableStandardClickToShowDesktop = false;
      };
      # Disable fn key opening emoji picker (0 = Do Nothing)
      "com.apple.HIToolbox" = {
        AppleFnUsageType = 0;
      };
      # Show full website address in Safari Smart Search field
      "com.apple.Safari" = {
        ShowFullURLInSmartSearchField = true;
      };
    };
  };

  # Power management (system sleep 5 min after display sleep)
  # Battery: display sleep 5 min, system sleep 10 min
  # AC: display sleep 10 min, system sleep 15 min
  # These take effect immediately after activation — no logout required
  system.activationScripts.postActivation.text = ''
    /System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u

    # Battery sleep settings
    pmset -b displaysleep 5 sleep 10

    # AC sleep settings
    pmset -c displaysleep 10 sleep 15

    # Configure Dock apps (must run as user, not root)
    sudo -u brettsmith /opt/homebrew/bin/dockutil --remove all --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Apps.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Calendar.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Messages.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /Applications/Safari.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /Applications/Ghostty.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /Applications/Obsidian.app
  '';

  system.stateVersion = 5;
}
