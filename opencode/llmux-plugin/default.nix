{ pkgs, lib, ... }:

pkgs.buildNpmPackage rec {
  pname = "opencode-llmux-plugin";
  version = "1.0.0";

  src = ./.;

  npmDepsHash = "sha256-7S2rECRVwhwgwGV8bwEWN7fE8MTFF3CbMGUZHXyF/R0=";

  nativeBuildInputs = [ pkgs.bun ];

  buildPhase = ''
    runHook preBuild
    bun build ./src/plugin.ts --outfile tmux-session-manager.js
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -p $out/share/opencode/plugins
    cp tmux-session-manager.js $out/share/opencode/plugins/
    runHook postInstall
  '';

  meta = {
    description = "OpenCode plugin shim for llmux tmux session state";
    platforms = lib.platforms.unix;
  };
}
