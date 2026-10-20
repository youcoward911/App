import DeviceActivity
import ManagedSettings
import Foundation

class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    let store = ManagedSettingsStore()
    let shared = SharedDefaults.shared

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        switch activity {
        case SharedDefaults.peekActivity:
            // Peek over — re-block if the lock is still running
            shared.peekExpiresAt = 0
            if shared.isLocked && shared.lockExpiresAt > Date().timeIntervalSince1970 {
                shared.applyShield(store)
            }

        case SharedDefaults.lockActivity:
            // Lock ran out — unblock (the app counts the streak next time it opens)
            shared.isLocked = false
            shared.peekCount = 0
            shared.peekExpiresAt = 0
            shared.stopWindows([SharedDefaults.peekActivity])
            shared.clearShield(store)

        default:
            break
        }
    }
}
