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

    # Enable Cmd+1 through Cmd+5 for switching desktops
    # You must first create 5 desktops in Mission Control manually
    CustomUserPreferences = {
      # Click wallpaper to show desktop: Only in Stage Manager
      "com.apple.WindowManager" = {
        EnableStandardClickToShowDesktop = false;
      };
      # Disable fn key opening emoji picker (0 = Do Nothing)
      "com.apple.HIToolbox" = {
        AppleFnUsageType = 0;
      };
      "com.apple.symbolichotkeys" = {
        AppleSymbolicHotKeys = {
          # Switch to Desktop 1: Cmd+1
          "118" = {
            enabled = true;
            value = {
              type = "standard";
              parameters = [ 49 18 1048576 ];
            };
          };
          # Switch to Desktop 2: Cmd+2
          "119" = {
            enabled = true;
            value = {
              type = "standard";
              parameters = [ 50 19 1048576 ];
            };
          };
          # Switch to Desktop 3: Cmd+3
          "120" = {
            enabled = true;
            value = {
              type = "standard";
              parameters = [ 51 20 1048576 ];
            };
          };
          # Switch to Desktop 4: Cmd+4
          "121" = {
            enabled = true;
            value = {
              type = "standard";
              parameters = [ 52 21 1048576 ];
            };
          };
          # Switch to Desktop 5: Cmd+5
          "122" = {
            enabled = true;
            value = {
              type = "standard";
              parameters = [ 53 23 1048576 ];
            };
          };
        };
      };
    };
  };

  # Apply settings without requiring logout
  system.activationScripts.postActivation.text = ''
    /System/Library/PrivateFrameworks/SystemAdministration.framework/Resources/activateSettings -u

    # Configure Dock apps (must run as user, not root)
    sudo -u brettsmith /opt/homebrew/bin/dockutil --remove all --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Apps.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Calendar.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /System/Applications/Messages.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add "/Applications/Google Chrome.app" --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /Applications/Ghostty.app --no-restart
    sudo -u brettsmith /opt/homebrew/bin/dockutil --add /Applications/Obsidian.app
  '';

  system.stateVersion = 5;
}
