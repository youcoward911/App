import DeviceActivity
import SwiftUI
import ManagedSettings

extension DeviceActivityReport.Context {
    static let totalActivity = Self("TotalActivity")
}

struct AppUsageEntry: Identifiable {
    let id = UUID()
    let name: String
    let duration: TimeInterval
    let token: ApplicationToken?
}

struct TotalActivityReport: DeviceActivityReportScene {
    let context: DeviceActivityReport.Context = .totalActivity
    let content: ([AppUsageEntry]) -> AppUsageView

    func makeConfiguration(
        representing data: DeviceActivityResults<DeviceActivityData>
    ) async -> [AppUsageEntry] {
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

        // Skip apps with negligible usage
        return totals
            .filter { $0.value.duration >= 60 }
            .map { AppUsageEntry(name: $0.key, duration: $0.value.duration, token: $0.value.token) }
            .sorted { $0.duration > $1.duration }
    }
}
