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
                    .foregroundColor(Color(hex: "4A4545"))
                Text("today")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "8A8380"))
            }
            .padding(.bottom, 16)

            // Divider
            Rectangle()
                .fill(Color(hex: "E0DCD8"))
                .frame(height: 1)
                .padding(.bottom, 12)

            if apps.isEmpty {
                Text("No usage data yet")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "8A8380"))
                    .padding(.vertical, 20)
            } else {
                // App list — show top 8
                ForEach(Array(apps.prefix(8))) { app in
                    appRow(app)
                }
            }
        }
        .padding(20)
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
                    .foregroundColor(Color(hex: "4A4545"))
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

    // Color coding: high usage = warm, low = cool
    private func barColor(_ duration: TimeInterval) -> Color {
        let hours = duration / 3600
        if hours >= 2 { return Color(hex: "C4918A") }  // dusty rose for heavy
        if hours >= 1 { return Color(hex: "A89490") }  // warm taupe for moderate
        return Color(hex: "B5AFA8")                     // gray for light
    }

    private func barTextColor(_ duration: TimeInterval) -> Color {
        let hours = duration / 3600
        if hours >= 2 { return Color(hex: "C4918A") }
        return Color(hex: "8A8380")
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
