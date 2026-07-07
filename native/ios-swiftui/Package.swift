// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "JazerShowcase",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
    ],
    products: [
        .library(name: "JazerShowcase", targets: ["JazerShowcase"]),
    ],
    targets: [
        .target(name: "JazerShowcase"),
        .testTarget(name: "JazerShowcaseTests", dependencies: ["JazerShowcase"]),
    ]
)
