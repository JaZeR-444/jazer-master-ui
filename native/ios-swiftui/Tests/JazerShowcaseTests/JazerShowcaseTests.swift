import XCTest
@testable import JazerShowcase

final class JazerShowcaseTests: XCTestCase {
    func testGeneratedTokenValues() {
        XCTAssertEqual(JazerRadius.md, 12.0)
        XCTAssertEqual(JazerSpace.md, 16.0)
        XCTAssertEqual(JazerSpace.lg, 24.0)
    }

    func testViewsInitialize() {
        _ = JazerButton("Primary", variant: .primary, theme: .dark)
        _ = JazerButton("Ghost", variant: .ghost, theme: .light)
        _ = ContentView()
    }
}
