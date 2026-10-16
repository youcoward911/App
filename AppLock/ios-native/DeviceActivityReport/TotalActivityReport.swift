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
        var apps: [AppUsageEntry] = []
        var seen = Set<String>()

        for await activityData in data {
            for await segment in activityData.activitySegments {
                for await category in segment.categories {
                    for await app in category.applications {
                        let name = app.application.localizedDisplayName ?? "Unknown"
                        let duration = app.totalActivityDuration

                        // Skip apps with negligible usage
                        guard duration >= 60 else { continue }

                        // Deduplicate by name
                        guard !seen.contains(name) else { continue }
                        seen.insert(name)

                        apps.append(AppUsageEntry(
                            name: name,
                            duration: duration,
                            token: app.application.token
                        ))
                    }
                }
            }
        }

        return apps.sorted { $0.duration > $1.duration }
    }
}
