{ pkgs, lib, ... }:

pkgs.buildNpmPackage rec {
  pname = "opencode-tmux-manager";
  version = "0.1.0";

  src = ./.;

  npmDepsHash = "sha256-JTKtTalIyRq2g+houZpP1LzdeFmK8Rs4vwxTPYyoF9s=";

  nativeBuildInputs = [ pkgs.bun ];

  buildPhase = ''
    runHook preBuild
    bun build --compile ./src/cli.ts --outfile ocmux
    bun build ./src/plugin.ts --outfile tmux-session-manager.js
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/bin $out/share/opencode/plugins
    cp ocmux $out/bin/
    cp tmux-session-manager.js $out/share/opencode/plugins/
    runHook postInstall
  '';

  meta = {
    description = "Tmux session manager for OpenCode";
    platforms = lib.platforms.unix;
  };
}
