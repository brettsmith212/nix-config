# Scaffold + run sequence for a new iOS app

Run these from the project root (`~/Documents/Developer/iOS/<AppName>`) after writing `project.yml`, `Sources/<AppName>App.swift`, `Sources/ContentView.swift`, and `.gitignore`.

Substitute `<AppName>` and a simulator name from `xcrun simctl list devices available | grep iPhone`.

## 1. Generate the Xcode project

```bash
xcodegen generate
```

## 2. First build (must succeed before xcode-build-server config works)

```bash
xcodebuild -project <AppName>.xcodeproj -scheme <AppName> \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' build \
  | xcode-build-server parse -av
```

If `.compile` ends up empty (1–2 bytes), rerun with `clean build` instead of `build` — incremental builds skip the swift-compile invocations that `parse` needs.

## 3. Wire up sourcekit-lsp

```bash
xcode-build-server config -scheme <AppName> -project <AppName>.xcodeproj
```

This writes `buildServer.json`. nvim's sourcekit-lsp uses it (plus `.compile`) on next open.

## 4. Boot simulator, install, launch

```bash
xcrun simctl boot "iPhone 17 Pro" 2>/dev/null
open -a Simulator
APP_PATH=$(xcodebuild -project <AppName>.xcodeproj -scheme <AppName> \
  -showBuildSettings -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  | awk -F' = ' '/^[[:space:]]+BUILT_PRODUCTS_DIR/ {print $2; exit}')/<AppName>.app
xcrun simctl install booted "$APP_PATH"
xcrun simctl launch booted com.brettsmith.<AppName>
```

## 5. (Optional) Stream app logs

```bash
xcrun simctl spawn booted log stream --level=debug \
  --predicate 'subsystem CONTAINS "com.brettsmith.<AppName>"'
```

## 6. Verify nvim LSP

Open a Swift file from the project root:

```bash
nvim Sources/<AppName>App.swift
```

Then inside the buffer:

- `:lua =vim.lsp.get_clients({ bufnr = 0 })` — should show `name = "sourcekit"`, `initialized = true`, `root_dir = <project root>`
- `gd` on `ContentView()` — should jump to its definition (local symbol, fastest test)
- `gd` on `View` or `App` — jumps into Apple's SDK (first request takes 10–30s while sourcekit indexes)
- `K` on `WindowGroup` — hover docs
