import SwiftUI
import FamilyControls
import ManagedSettings

struct AppUsageView: View {
    let apps: [AppUsageEntry]

    private var maxDuration: TimeInterval {
        apps.first?.duration ?? 1
    }

    private var totalDuration: TimeInterval {
        apps.reduce(0) { $0 + $1.duration }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Total header
            HStack(alignment: .firstTextBaseline) {
                Text(formatted(totalDuration))
                    .font(.system(size: 28, weight: .black))
                    .foregroundColor(Color(hex: "2D2D2D"))
                Text("today")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "6E6468"))
            }
            .padding(.bottom, 16)

            // Divider
            Rectangle()
                .fill(Color(hex: "F3E1E5"))
                .frame(height: 1)
                .padding(.bottom, 12)

            if apps.isEmpty {
                Text("No usage data yet")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "6E6468"))
                    .padding(.vertical, 20)
            } else {
                // App list: top 5 (the card in the app is sized for exactly this)
                ForEach(Array(apps.prefix(5))) { app in
                    appRow(app)
                }
            }
        }
        .padding(20)
        // Pin to the top so a short list never floats or gets cut off in the fixed-height card
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    @ViewBuilder
    private func appRow(_ app: AppUsageEntry) -> some View {
        HStack(spacing: 12) {
            // App icon via token
            if let token = app.token {
                Label(token)
                    .labelStyle(.iconOnly)
                    .frame(width: 36, height: 36)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: "E0DCD8"))
                    .frame(width: 36, height: 36)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(app.name)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(Color(hex: "2D2D2D"))
                    .lineLimit(1)

                HStack(spacing: 8) {
                    // Usage bar
                    GeometryReader { geo in
                        RoundedRectangle(cornerRadius: 3)
                            .fill(barColor(app.duration))
                            .frame(
                                width: max(4, geo.size.width * CGFloat(app.duration / maxDuration)),
                                height: 6
                            )
                    }
                    .frame(height: 6)

                    Text(formatted(app.duration))
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(barTextColor(app.duration))
                        .fixedSize()
                }
            }
        }
        .padding(.vertical, 8)
    }

    // App pink; heavier use (2h+) gets a deeper pink
    private func barColor(_ duration: TimeInterval) -> Color {
        duration >= 2 * 3600 ? Color(hex: "E97C95") : Color(hex: "F7A0B2")
    }

    private func barTextColor(_ duration: TimeInterval) -> Color {
        duration >= 2 * 3600 ? Color(hex: "E97C95") : Color(hex: "2D2D2D")
    }

    private func formatted(_ interval: TimeInterval) -> String {
        let h = Int(interval) / 3600
        let m = (Int(interval) % 3600) / 60
        if h > 0 { return "\(h)h \(m)m" }
        return "\(m)m"
    }
}

// Hex color helper
extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex)
        var hexNumber: UInt64 = 0
        scanner.scanHexInt64(&hexNumber)
        let r = Double((hexNumber & 0xFF0000) >> 16) / 255
        let g = Double((hexNumber & 0x00FF00) >> 8) / 255
        let b = Double(hexNumber & 0x0000FF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
