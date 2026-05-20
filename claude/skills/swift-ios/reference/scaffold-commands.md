# Scaffold + run sequence for a new iOS app

Run these from the project root (`~/Documents/Developer/iOS/<AppName>`) after writing `project.yml`, `Sources/<AppName>App.swift`, `Sources/ContentView.swift`, `.gitignore`, and `Makefile` (see [Makefile.template](Makefile.template); substitute `SCHEME` / `PROJECT`).

Substitute `<AppName>` and a simulator name from `xcrun simctl list devices available | grep iPhone`.

## 1. Generate the Xcode project

```bash
make gen        # alias for `xcodegen generate`
```

## 2. First build (must succeed before xcode-build-server config works)

```bash
make build
```

`make build` already pipes through `xcode-build-server parse -av`. If `.compile` ends up empty (1–2 bytes), run `make refresh-lsp` instead — incremental builds skip the swift-compile invocations that `parse` needs.

## 3. Wire up sourcekit-lsp

```bash
make lsp-config
```

This writes `buildServer.json`. nvim's sourcekit-lsp uses it (plus `.compile`) on next open.

## 4. Boot simulator, install, launch

```bash
make run
```

`make run` = `build` + `install` + `launch`. It boots the simulator (waits via `simctl bootstatus booted -b`), installs the `.app` from `build/Build/Products/Debug-iphonesimulator/<Scheme>.app`, resolves the bundle id from `xcodebuild -showBuildSettings`, terminates any previous instance, and launches.

Override the simulator per-invocation:

```bash
make run SIM_NAME="iPhone 16"
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
