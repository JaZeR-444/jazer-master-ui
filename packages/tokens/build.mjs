/**
 * JaZeR token build — one source of truth → web (SCSS/CSS), iOS (Swift), Flutter (Dart).
 *
 * Custom formats read the resolved token tree directly (no transforms), so output is a
 * faithful, deterministic projection of src/**. No timestamps are emitted, which keeps
 * the generated/ directory idempotent for the CI drift check (`pnpm --filter @jazer/tokens check`).
 */
import StyleDictionary from 'style-dictionary';

const HEADER = [
  '/**',
  ' * JaZeR Design Tokens — GENERATED FILE. Do not edit by hand.',
  ' * Source: packages/tokens/src/**   Rebuild: pnpm --filter @jazer/tokens build',
  ' */',
  '',
].join('\n');

/* ----------------------------- helpers ----------------------------- */
const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
// Native identifiers can't start with a digit: "2xl" -> "xl2", "3xl" -> "xl3".
const nativeIdent = (s) => {
  const c = camel(s);
  return /^\d/.test(c) ? c.replace(/^(\d+)(.*)$/, '$2$1') : c;
};

// 0/255-style double, always with a decimal point: 16 -> "16.0", 0.05 -> "0.05".
const dbl = (n) => (Number.isInteger(n) ? `${n}.0` : String(parseFloat(n.toFixed(4))));

function parseColor(value) {
  const v = String(value).trim();
  let m = v.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3)
      h = h
        .split('')
        .map((x) => x + x)
        .join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  m = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (m)
    return {
      r: Math.round(+m[1]),
      g: Math.round(+m[2]),
      b: Math.round(+m[3]),
      a: m[4] !== undefined ? +m[4] : 1,
    };
  return null;
}

function parsePx(value) {
  const v = String(value).trim();
  let m = v.match(/^(-?[\d.]+)rem$/);
  if (m) return +m[1] * 16;
  m = v.match(/^(-?[\d.]+)px$/);
  if (m) return +m[1];
  m = v.match(/^(-?[\d.]+)$/);
  if (m) return +m[1];
  return null;
}

const isTheme = (t) => t.path[0] === 'theme';
const themeOf = (t) => t.path[1]; // 'dark' | 'light'
const baseName = (t) => t.path.join('-'); // color-cyan, space-md
const themeKey = (t) => t.path.slice(2).join('-'); // bg, surface-hover, on-accent

const swiftColor = (val) => {
  const c = parseColor(val);
  return c
    ? `Color(.sRGB, red: ${dbl(c.r / 255)}, green: ${dbl(c.g / 255)}, blue: ${dbl(c.b / 255)}, opacity: ${dbl(c.a)})`
    : null;
};
const dartColor = (val) => {
  const c = parseColor(val);
  if (!c) return null;
  const hex = [Math.round(c.a * 255), c.r, c.g, c.b]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `Color(0x${hex})`;
};

/* ----------------------------- formats ----------------------------- */
StyleDictionary.registerFormat({
  name: 'jazer/css',
  format: ({ dictionary }) => {
    const base = dictionary.allTokens.filter((t) => !isTheme(t));
    const theme = (name) => dictionary.allTokens.filter((t) => isTheme(t) && themeOf(t) === name);
    const baseLines = base.map((t) => `  --${baseName(t)}: ${t.value};`).join('\n');
    const themeLines = (toks) => toks.map((t) => `  --theme-${themeKey(t)}: ${t.value};`).join('\n');
    return [
      HEADER,
      ':root {',
      baseLines,
      '',
      '  /* semantic theme — dark is the default */',
      themeLines(theme('dark')),
      '}',
      '',
      '[data-theme="light"] {',
      themeLines(theme('light')),
      '}',
      '',
      '[data-theme="dark"] {',
      themeLines(theme('dark')),
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'jazer/scss-tokens',
  format: ({ dictionary }) => {
    const base = dictionary.allTokens.filter((t) => !isTheme(t));
    return `${HEADER}${base.map((t) => `$${baseName(t)}: ${t.value};`).join('\n')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'jazer/scss-themes',
  format: ({ dictionary }) => {
    const mk = (name) => {
      const entries = dictionary.allTokens
        .filter((t) => isTheme(t) && themeOf(t) === name)
        .map((t) => `  '${themeKey(t)}': ${t.value},`)
        .join('\n');
      return `$jazer-theme-${name}: (\n${entries}\n);`;
    };
    return `${HEADER}${mk('dark')}\n\n${mk('light')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'jazer/swift',
  format: ({ dictionary }) => {
    const palette = dictionary.allTokens.filter((t) => t.type === 'color' && !isTheme(t));
    const paletteLines = palette
      .map((t) => {
        const sc = swiftColor(t.value);
        return sc ? `    public static let ${camel(t.path.slice(1).join('-'))} = ${sc}` : null;
      })
      .filter(Boolean)
      .join('\n');

    const keys = dictionary.allTokens.filter((t) => isTheme(t) && themeOf(t) === 'dark').map(themeKey);
    const fields = keys.map((k) => `    public let ${camel(k)}: Color`).join('\n');
    const initParams = keys.map((k) => `${camel(k)}: Color`).join(', ');
    const initBody = keys.map((k) => `        self.${camel(k)} = ${camel(k)}`).join('\n');
    const instance = (name) => {
      const args = dictionary.allTokens
        .filter((t) => isTheme(t) && themeOf(t) === name)
        .map((t) => `${camel(themeKey(t))}: ${swiftColor(t.value)}`)
        .join(', ');
      return `    public static let ${name} = JazerTheme(${args})`;
    };

    const dims = (prefix, enumName) => {
      const lines = dictionary.allTokens
        .filter((t) => t.path[0] === prefix)
        .map((t) => {
          const px = parsePx(t.value);
          return px == null ? null : `    public static let ${nativeIdent(t.path[1])}: CGFloat = ${dbl(px)}`;
        })
        .filter(Boolean)
        .join('\n');
      return `public enum ${enumName} {\n${lines}\n}`;
    };

    return [
      HEADER + 'import SwiftUI',
      '',
      '/// Raw brand palette.',
      'public enum JazerColor {',
      paletteLines,
      '}',
      '',
      '/// Semantic, theme-aware colors. Use `JazerTheme.dark` / `JazerTheme.light`.',
      'public struct JazerTheme {',
      fields,
      '',
      `    public init(${initParams}) {`,
      initBody,
      '    }',
      '',
      instance('dark'),
      instance('light'),
      '}',
      '',
      dims('space', 'JazerSpace'),
      '',
      dims('radius', 'JazerRadius'),
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'jazer/dart',
  format: ({ dictionary }) => {
    const palette = dictionary.allTokens.filter((t) => t.type === 'color' && !isTheme(t));
    const paletteLines = palette
      .map((t) => {
        const dc = dartColor(t.value);
        return dc ? `  static const Color ${camel(t.path.slice(1).join('-'))} = ${dc};` : null;
      })
      .filter(Boolean)
      .join('\n');

    const keys = dictionary.allTokens.filter((t) => isTheme(t) && themeOf(t) === 'dark').map(themeKey);
    const fields = keys.map((k) => `  final Color ${camel(k)};`).join('\n');
    const ctorParams = keys.map((k) => `required this.${camel(k)}`).join(', ');
    const instance = (name) => {
      const args = dictionary.allTokens
        .filter((t) => isTheme(t) && themeOf(t) === name)
        .map((t) => `${camel(themeKey(t))}: ${dartColor(t.value)}`)
        .join(', ');
      return `  static const JazerTheme ${name} = JazerTheme(${args});`;
    };

    const dims = (prefix, className) => {
      const lines = dictionary.allTokens
        .filter((t) => t.path[0] === prefix)
        .map((t) => {
          const px = parsePx(t.value);
          return px == null ? null : `  static const double ${nativeIdent(t.path[1])} = ${dbl(px)};`;
        })
        .filter(Boolean)
        .join('\n');
      return `class ${className} {\n  ${className}._();\n${lines}\n}`;
    };

    return [
      HEADER + "import 'package:flutter/material.dart';",
      '',
      '/// Raw brand palette.',
      'class JazerColors {',
      '  JazerColors._();',
      paletteLines,
      '}',
      '',
      '/// Semantic, theme-aware colors. Use `JazerTheme.dark` / `JazerTheme.light`.',
      '@immutable',
      'class JazerTheme {',
      fields,
      `  const JazerTheme({${ctorParams}});`,
      instance('dark'),
      instance('light'),
      '}',
      '',
      dims('space', 'JazerSpace'),
      '',
      dims('radius', 'JazerRadius'),
      '',
    ].join('\n');
  },
});

/* ----------------------------- transforms ----------------------------- */
// Give every token a unique, full-path name so Style Dictionary's output-collision
// detector stays quiet. (Our formats key off `path`, not `name`, but a unique name
// is the clean way to suppress the warning.) No value transforms — values stay as
// authored/resolved, preserving brand fidelity.
StyleDictionary.registerTransform({
  name: 'name/jazer',
  type: 'name',
  transform: (token) => token.path.join('-'),
});

const TRANSFORMS = ['name/jazer'];

/* ----------------------------- build ----------------------------- */
const sd = new StyleDictionary({
  source: ['src/primitives/**/*.json', 'src/semantic/**/*.json'],
  log: { verbosity: 'default', warnings: 'warn' },
  platforms: {
    css: {
      transforms: TRANSFORMS,
      buildPath: 'generated/css/',
      files: [{ destination: 'variables.css', format: 'jazer/css' }],
    },
    scss: {
      transforms: TRANSFORMS,
      buildPath: 'generated/scss/',
      files: [
        { destination: '_tokens.scss', format: 'jazer/scss-tokens' },
        { destination: '_themes.scss', format: 'jazer/scss-themes' },
      ],
    },
    ios: {
      transforms: TRANSFORMS,
      buildPath: 'generated/ios/',
      files: [{ destination: 'JazerTheme.swift', format: 'jazer/swift' }],
    },
    flutter: {
      transforms: TRANSFORMS,
      buildPath: 'generated/flutter/',
      files: [{ destination: 'jazer_theme.dart', format: 'jazer/dart' }],
    },
  },
});

await sd.buildAllPlatforms();
console.log('✓ JaZeR tokens built → packages/tokens/generated/{css,scss,ios,flutter}');
