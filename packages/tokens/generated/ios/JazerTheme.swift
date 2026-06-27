/**
 * JaZeR Design Tokens — GENERATED FILE. Do not edit by hand.
 * Source: packages/tokens/src/**   Rebuild: pnpm --filter @jazer/tokens build
 */
import SwiftUI

/// Raw brand palette.
public enum JazerColor {
    public static let cyan = Color(.sRGB, red: 0.0, green: 0.949, blue: 0.9176, opacity: 1.0)
    public static let pink = Color(.sRGB, red: 1.0, green: 0.0, blue: 0.4314, opacity: 1.0)
    public static let purple = Color(.sRGB, red: 0.5765, green: 0.2, blue: 0.9176, opacity: 1.0)
    public static let magenta = Color(.sRGB, red: 1.0, green: 0.0, blue: 1.0, opacity: 1.0)
    public static let blueLight = Color(.sRGB, red: 0.0, green: 0.949, blue: 0.9961, opacity: 1.0)
    public static let blueMid = Color(.sRGB, red: 0.3098, green: 0.6745, blue: 0.9961, opacity: 1.0)
    public static let yellow = Color(.sRGB, red: 1.0, green: 0.7451, blue: 0.0431, opacity: 1.0)
    public static let orange = Color(.sRGB, red: 1.0, green: 0.549, blue: 0.0, opacity: 1.0)
    public static let black = Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 1.0)
    public static let white = Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0)
    public static let gray = Color(.sRGB, red: 0.6902, green: 0.6902, blue: 0.6902, opacity: 1.0)
    public static let grayDark = Color(.sRGB, red: 0.502, green: 0.502, blue: 0.502, opacity: 1.0)
    public static let grayLight = Color(.sRGB, red: 0.9412, green: 0.9412, blue: 0.9412, opacity: 1.0)
}

/// Semantic, theme-aware colors. Use `JazerTheme.dark` / `JazerTheme.light`.
public struct JazerTheme {
    public let bg: Color
    public let surface: Color
    public let surfaceHover: Color
    public let overlay: Color
    public let text: Color
    public let textMuted: Color
    public let textSubtle: Color
    public let border: Color
    public let accent: Color
    public let onAccent: Color

    public init(bg: Color, surface: Color, surfaceHover: Color, overlay: Color, text: Color, textMuted: Color, textSubtle: Color, border: Color, accent: Color, onAccent: Color) {
        self.bg = bg
        self.surface = surface
        self.surfaceHover = surfaceHover
        self.overlay = overlay
        self.text = text
        self.textMuted = textMuted
        self.textSubtle = textSubtle
        self.border = border
        self.accent = accent
        self.onAccent = onAccent
    }

    public static let dark = JazerTheme(bg: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 1.0), surface: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 0.05), surfaceHover: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 0.08), overlay: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 0.7), text: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0), textMuted: Color(.sRGB, red: 0.6902, green: 0.6902, blue: 0.6902, opacity: 1.0), textSubtle: Color(.sRGB, red: 0.502, green: 0.502, blue: 0.502, opacity: 1.0), border: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 0.1), accent: Color(.sRGB, red: 0.0, green: 0.949, blue: 0.9176, opacity: 1.0), onAccent: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 1.0))
    public static let light = JazerTheme(bg: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0), surface: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 0.03), surfaceHover: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 0.06), overlay: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 0.95), text: Color(.sRGB, red: 0.102, green: 0.102, blue: 0.102, opacity: 1.0), textMuted: Color(.sRGB, red: 0.4, green: 0.4, blue: 0.4, opacity: 1.0), textSubtle: Color(.sRGB, red: 0.6, green: 0.6, blue: 0.6, opacity: 1.0), border: Color(.sRGB, red: 0.0, green: 0.0, blue: 0.0, opacity: 0.12), accent: Color(.sRGB, red: 0.0, green: 0.949, blue: 0.9176, opacity: 1.0), onAccent: Color(.sRGB, red: 1.0, green: 1.0, blue: 1.0, opacity: 1.0))
}

public enum JazerSpace {
    public static let xs: CGFloat = 4.0
    public static let sm: CGFloat = 8.0
    public static let md: CGFloat = 16.0
    public static let lg: CGFloat = 24.0
    public static let xl: CGFloat = 32.0
    public static let xl2: CGFloat = 48.0
    public static let xl3: CGFloat = 64.0
}

public enum JazerRadius {
    public static let sm: CGFloat = 6.0
    public static let md: CGFloat = 12.0
    public static let lg: CGFloat = 16.0
    public static let xl: CGFloat = 24.0
    public static let full: CGFloat = 9999.0
}
