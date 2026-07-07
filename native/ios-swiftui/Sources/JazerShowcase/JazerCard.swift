import SwiftUI

/// A card styled entirely from the generated JaZeR tokens — same brand as web & Flutter.
public struct JazerCard: View {
    private let title: String
    private let message: String
    private let theme: JazerTheme
    private let elevated: Bool

    public init(
        title: String,
        message: String,
        theme: JazerTheme = .dark,
        elevated: Bool = false
    ) {
        self.title = title
        self.message = message
        self.theme = theme
        self.elevated = elevated
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: JazerSpace.xs) {
            Text(title)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundStyle(theme.text)
            Text(message)
                .foregroundStyle(theme.textMuted)
        }
        .padding(JazerSpace.lg)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.surface)
        .overlay(
            RoundedRectangle(cornerRadius: JazerRadius.lg)
                .stroke(theme.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: JazerRadius.lg))
        .shadow(
            color: elevated ? Color.black.opacity(0.25) : .clear,
            radius: elevated ? 16 : 0,
            y: elevated ? 8 : 0
        )
    }
}

#if DEBUG
struct JazerCard_Previews: PreviewProvider {
    static var previews: some View {
        JazerCard(title: "Cyberpunk surface", message: "Themed from one token source.", elevated: true)
            .padding(JazerSpace.xl)
            .background(JazerTheme.dark.bg)
    }
}
#endif
