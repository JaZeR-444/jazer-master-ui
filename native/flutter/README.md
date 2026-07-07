# JaZeR · Flutter showcase

A Flutter app that renders the JaZeR **Button** styled from the **generated** design tokens —
the same brand as the web design system, from one source.

## Tokens

`lib/generated/jazer_theme.dart` is **generated** (do not edit). It is produced by
`@jazer/tokens` and copied here by `packages/tokens/distribute.mjs`. It exposes:

- `JazerColors` — the raw brand palette
- `JazerTheme.dark` / `JazerTheme.light` — semantic, theme-aware colors
- `JazerSpace`, `JazerRadius` — spacing & radius scales

## Run / test (needs the Flutter SDK)

```bash
flutter pub get
flutter run          # launches the showcase (web/desktop/emulator)
flutter analyze
flutter test
```

> This repo is authored on Windows where the Flutter SDK may not be installed; CI
> (`.github/workflows`) runs `flutter analyze` + `flutter test`.
