import DeviceActivity
import SwiftUI
import ManagedSettings

extension DeviceActivityReport.Context {
    static let topAppWeek = Self("TopAppWeek")
}

// The single most-used app over the filter's interval (the last 7 days), summed across days
struct TopAppReport: DeviceActivityReportScene {
    let context: DeviceActivityReport.Context = .topAppWeek
    let content: (AppUsageEntry?) -> TopAppView

    func makeConfiguration(
        representing data: DeviceActivityResults<DeviceActivityData>
    ) async -> AppUsageEntry? {
        var totals: [String: (duration: TimeInterval, token: ApplicationToken?)] = [:]

        for await activityData in data {
            for await segment in activityData.activitySegments {
                for await category in segment.categories {
                    for await app in category.applications {
                        let name = app.application.localizedDisplayName ?? "Unknown"
                        let prev = totals[name]
                        totals[name] = ((prev?.duration ?? 0) + app.totalActivityDuration,
                                        prev?.token ?? app.application.token)
                    }
                }
            }
        }

        guard let top = totals.max(by: { $0.value.duration < $1.value.duration }),
              top.value.duration >= 60 else { return nil }
        return AppUsageEntry(name: top.key, duration: top.value.duration, token: top.value.token)
    }
}

struct TopAppView: View {
    let app: AppUsageEntry?

    var body: some View {
        HStack(spacing: 14) {
            if let token = app?.token {
                Label(token)
                    .labelStyle(.iconOnly)
                    .scaleEffect(1.5)
                    .frame(width: 48, height: 48)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            } else {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(hex: "F3E1E5"))
                    .frame(width: 48, height: 48)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(app?.name ?? "No slop yet")
                    .font(.system(size: 18, weight: .black))
                    .foregroundColor(Color(hex: "2D2D2D"))
                    .lineLimit(1)
                Text(app.map { "\(formatted($0.duration)) this week" } ?? "Not enough screen time this week")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(hex: "F7A0B2"))
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private func formatted(_ interval: TimeInterval) -> String {
        let h = Int(interval) / 3600
        let m = (Int(interval) % 3600) / 60
        return h > 0 ? "\(h)h \(m)m" : "\(m)m"
    }
}
