import DeviceActivity
import SwiftUI

@main
struct ScrollPigReportExtension: DeviceActivityReportExtension {
    var body: some DeviceActivityReportScene {
        TotalActivityReport { appUsage in
            AppUsageView(apps: appUsage)
        }
    }
}
