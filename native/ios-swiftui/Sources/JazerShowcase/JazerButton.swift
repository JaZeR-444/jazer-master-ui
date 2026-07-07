import SwiftUI

public enum JazerButtonVariant {
    case primary, secondary, ghost
}

/// A button styled entirely from the generated JaZeR tokens — same brand as web & Flutter.
public struct JazerButton: View {
    private let title: String
    private let variant: JazerButtonVariant
    private let theme: JazerTheme
    private let action: () -> Void

    public init(
        _ title: String,
        variant: JazerButtonVariant = .primary,
        theme: JazerTheme = .dark,
        action: @escaping () -> Void = {}
    ) {
        self.title = title
        self.variant = variant
        self.theme = theme
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(.bold)
                .padding(.horizontal, JazerSpace.lg)
                .padding(.vertical, JazerSpace.sm)
                .foregroundStyle(foreground)
                .background(background)
                .overlay(
                    RoundedRectangle(cornerRadius: JazerRadius.md)
                        .stroke(border, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: JazerRadius.md))
        }
        .buttonStyle(.plain)
    }

    private var background: Color {
        switch variant {
        case .primary: return JazerColor.cyan
        case .secondary, .ghost: return .clear
        }
    }

    private var foreground: Color {
        switch variant {
        case .primary: return theme.onAccent
        case .secondary: return theme.accent
        case .ghost: return theme.text
        }
    }

    private var border: Color {
        switch variant {
        case .secondary: return theme.accent
        default: return .clear
        }
    }
}

#if DEBUG
struct JazerButton_Previews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: JazerSpace.sm) {
            JazerButton("Primary", variant: .primary)
            JazerButton("Secondary", variant: .secondary)
            JazerButton("Ghost", variant: .ghost)
        }
        .padding(JazerSpace.xl)
        .background(JazerTheme.dark.bg)
    }
}
#endif
