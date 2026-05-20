---
name: swift-ios
description: Build and iterate on Swift iOS/macOS apps from Neovim + shell (no Xcode GUI) using XcodeGen, xcode-build-server, and sourcekit-lsp. Use when creating a new iOS/macOS app, debugging sourcekit-lsp goto-def/completion, running on the iOS Simulator from CLI, or setting up an Apple-platform project for nvim.
---

# Swift / iOS / macOS app development workflow

The user develops Apple-platform apps from **Neovim + Amp in a shell**, using Xcode only for debugging, asset catalogs, profiling, and signing — never for editing code.

## Toolchain (all in user's nix-config / Brewfile)

- **XcodeGen** — generates `.xcodeproj` from `project.yml` (gitignored project file = no merge conflicts)
- **xcode-build-server** — bridges `xcodebuild` to `sourcekit-lsp` for Xcode projects via `buildServer.json` + `.compile`
- **sourcekit-lsp** — ships with Xcode toolchain, run via `xcrun sourcekit-lsp`, configured in `nvim/lua/plugins/swift.lua`
- **xcodebuild / xcrun simctl** — build, install, and launch on the iOS Simulator from the shell
- **make** — single entrypoint for build / install / launch / test / clean / refresh-lsp

Standard project location: `~/Documents/Developer/iOS/<AppName>/`

## Critical gotcha: the build pipe

`sourcekit-lsp` needs per-file compile commands to provide goto-definition, completion, and diagnostics. `xcode-build-server` only learns these by **parsing a live `xcodebuild` log**, not from the project file alone.

Every build target in the `Makefile` pipes through `xcode-build-server parse -av`:

```bash
xcodebuild -project <App>.xcodeproj -scheme <App> \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath build build \
  | xcode-build-server parse -av
```

This writes/updates `.compile` in the project root. Without it, sourcekit attaches but symbols stay unresolved and `gd` silently does nothing.

Use `make refresh-lsp` (which does `clean build`) when `.compile` is empty/stale — incremental builds emit no Swift compile commands for `parse` to capture.

## Creating a new app

1. **Make the project dir:**
   ```bash
   mkdir -p ~/Documents/Developer/iOS/<AppName>/Sources
   cd ~/Documents/Developer/iOS/<AppName>
   ```

2. **Write `project.yml`** (see [reference/project.yml.template](reference/project.yml.template)) — substitute `<AppName>` and `com.<user>.<AppName>` bundle id.

3. **Write source files** in `Sources/`:
   - `<AppName>App.swift` — `@main struct <AppName>App: App { var body: some Scene { WindowGroup { ContentView() } } }`
   - `ContentView.swift` — a `struct ContentView: View`

4. **Add `.gitignore`** (see [reference/gitignore.template](reference/gitignore.template)) — ignores `*.xcodeproj/`, `buildServer.json`, `.compile`, `.bsp/`, `build/`, `DerivedData/`, `xcuserdata/`, `Config.xcconfig`.

5. **Add `Makefile`** at the project root (see [reference/Makefile.template](reference/Makefile.template)). Substitute `SCHEME` and `PROJECT` for the new app. This is the canonical driver — every new app gets one so daily iteration is `make run` (build + install + launch). Every build is piped through `xcode-build-server parse -av` to keep `.compile` fresh for sourcekit-lsp, and `PRODUCT_BUNDLE_IDENTIFIER` is resolved at launch time from `xcodebuild -showBuildSettings` (works for sample-code projects whose id is derived from `${DEVELOPMENT_TEAM}`).

6. **(Optional) Add secrets**: copy [reference/Config.xcconfig.example.template](reference/Config.xcconfig.example.template) to `Config.xcconfig.example`, fill in keys, and add `configFiles: { Debug: Config.xcconfig, Release: Config.xcconfig }` under your target in `project.yml`. `Config.xcconfig` itself is gitignored.

7. **Generate, build, wire up LSP, launch** (see [reference/scaffold-commands.md](reference/scaffold-commands.md) for the exact sequence).

## Daily workflow

| Triggered by | Run |
|---|---|
| Edited Swift source, want to see it on the sim | `make run` |
| Changed `project.yml` (added file, target, setting) | `make gen run` |
| Added/renamed a source file | `make gen run` |
| Want to build without launching | `make build` |
| Run tests | `make test` |
| sourcekit-lsp seems confused or symbols don't resolve | `make refresh-lsp` (clean build through the pipe), then restart nvim |
| Reset everything (DerivedData, `.compile`, `.bsp`) | `make clean` |

`SIM_NAME` defaults to `iPhone 17 Pro` and can be overridden per-invocation: `make run SIM_NAME="iPhone 16"`.

## When the user reports "LSP not working" / "gd doesn't jump"

Diagnose in this order — don't skip steps:

1. **Is sourcekit attached?** From a `.swift` buffer: `:lua =vim.lsp.get_clients({ bufnr = 0 })` — confirm `name = "sourcekit"` and `initialized = true` and `root_dir` points at the project root.
2. **Does `buildServer.json` exist** at project root? If not: `make lsp-config` (requires at least one successful `make build` first).
3. **Does `.compile` exist and have content** (`wc -l .compile` should be > 1)? If empty/tiny: `make refresh-lsp`.
4. **Test on a local symbol first**, not on `import SwiftUI` — `gd` on a module import has no destination. Try `gd` on `ContentView()` or on a protocol like `View`.
5. **Restart nvim** after regenerating `.compile` so the LSP client picks up new compile commands.

## When Xcode is still required

Do not try to script these — open Xcode:
- LLDB debugger UI / view hierarchy inspector / Instruments
- `Assets.xcassets` editing (image sets, app icons, colors)
- Signing & provisioning profile setup
- Storyboards / xibs (avoid by using SwiftUI)
- iOS device deployment without `xcrun devicectl` setup

## Notes

- SwiftUI previews **only work inside Xcode**. From nvim, iterate by running the simulator: edit → `make run`.
- First sourcekit request after a fresh build can take 10–30s while it indexes the SDK. Subsequent requests are fast.
- For pure SwiftPM packages (no `.xcodeproj`), sourcekit works out of the box — `xcode-build-server` and `buildServer.json` are only for Xcode projects.
- The nvim Swift config lives at [`nvim/lua/plugins/swift.lua`](file:///Users/brettsmith/.config/nix-config/nvim/lua/plugins/swift.lua) in the user's nix-config. Keep it minimal: `servers = { sourcekit = {} }` — the bundled lspconfig definition handles `cmd`, `filetypes`, and `root_dir` correctly. Custom `root_dir` functions using the old `function(fname)` signature silently fail under Neovim 0.11+.
