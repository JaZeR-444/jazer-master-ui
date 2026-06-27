import SwiftUI

/// The SwiftUI pillar's showcase screen — a themed Button gallery with a light/dark toggle.
public struct ContentView: View {
    @State private var isDark = true

    private var theme: JazerTheme { isDark ? .dark : .light }

    public init() {}

    public var body: some View {
        VStack(alignment: .leading, spacing: JazerSpace.md) {
            HStack {
                Text("JaZeR · SwiftUI")
                    .font(.title)
                    .bold()
                    .foregroundStyle(theme.text)
                Spacer()
                Button(isDark ? "Light" : "Dark") { isDark.toggle() }
                    .foregroundStyle(theme.accent)
            }

            HStack(spacing: JazerSpace.sm) {
                JazerButton("Primary", variant: .primary, theme: theme)
                JazerButton("Secondary", variant: .secondary, theme: theme)
                JazerButton("Ghost", variant: .ghost, theme: theme)
            }
        }
        .padding(JazerSpace.lg)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(theme.bg)
    }
}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif
