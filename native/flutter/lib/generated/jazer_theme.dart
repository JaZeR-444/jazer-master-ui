/**
 * JaZeR Design Tokens — GENERATED FILE. Do not edit by hand.
 * Source: packages/tokens/src/**   Rebuild: pnpm --filter @jazer/tokens build
 */
import 'package:flutter/material.dart';

/// Raw brand palette.
class JazerColors {
  JazerColors._();
  static const Color cyan = Color(0xFF00F2EA);
  static const Color pink = Color(0xFFFF006E);
  static const Color purple = Color(0xFF9333EA);
  static const Color magenta = Color(0xFFFF00FF);
  static const Color blueLight = Color(0xFF00F2FE);
  static const Color blueMid = Color(0xFF4FACFE);
  static const Color yellow = Color(0xFFFFBE0B);
  static const Color orange = Color(0xFFFF8C00);
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color gray = Color(0xFFB0B0B0);
  static const Color grayDark = Color(0xFF808080);
  static const Color grayLight = Color(0xFFF0F0F0);
}

/// Semantic, theme-aware colors. Use `JazerTheme.dark` / `JazerTheme.light`.
@immutable
class JazerTheme {
  final Color bg;
  final Color surface;
  final Color surfaceHover;
  final Color overlay;
  final Color text;
  final Color textMuted;
  final Color textSubtle;
  final Color border;
  final Color accent;
  final Color onAccent;
  const JazerTheme({required this.bg, required this.surface, required this.surfaceHover, required this.overlay, required this.text, required this.textMuted, required this.textSubtle, required this.border, required this.accent, required this.onAccent});
  static const JazerTheme dark = JazerTheme(bg: Color(0xFF000000), surface: Color(0x0DFFFFFF), surfaceHover: Color(0x14FFFFFF), overlay: Color(0xB3000000), text: Color(0xFFFFFFFF), textMuted: Color(0xFFB0B0B0), textSubtle: Color(0xFF808080), border: Color(0x1AFFFFFF), accent: Color(0xFF00F2EA), onAccent: Color(0xFF000000));
  static const JazerTheme light = JazerTheme(bg: Color(0xFFFFFFFF), surface: Color(0x08000000), surfaceHover: Color(0x0F000000), overlay: Color(0xF2FFFFFF), text: Color(0xFF1A1A1A), textMuted: Color(0xFF666666), textSubtle: Color(0xFF999999), border: Color(0x1F000000), accent: Color(0xFF00F2EA), onAccent: Color(0xFFFFFFFF));
}

class JazerSpace {
  JazerSpace._();
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xl2 = 48.0;
  static const double xl3 = 64.0;
}

class JazerRadius {
  JazerRadius._();
  static const double sm = 6.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double full = 9999.0;
}
