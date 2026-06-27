# JaZeR · SwiftUI showcase

A SwiftUI package that renders the JaZeR **Button** styled from the **generated** design
tokens — the same brand as web & Flutter, from one source.

## Tokens

`Sources/JazerShowcase/Generated/JazerTheme.swift` is **generated** (do not edit). It is
produced by `@jazer/tokens` and copied here by `packages/tokens/distribute.mjs`. It exposes:

- `JazerColor` — the raw brand palette
- `JazerTheme.dark` / `JazerTheme.light` — semantic, theme-aware colors
- `JazerSpace`, `JazerRadius` — spacing & radius scales

## Build / test (needs macOS + Xcode toolchain)

```bash
swift build
swift test
```

> **Authored on Windows, built on macOS.** SwiftUI/Xcode cannot build on Windows, so this
> code is verified by the `ios` job in `.github/workflows` on a `macos-latest` runner.
> To embed in an iOS app, add this package and use `ContentView()` / `JazerButton`.
