import ManagedSettings
import ManagedSettingsUI

class ShieldActionExtension: ShieldActionDelegate {
    let shared = SharedDefaults.shared

    override func handle(action: ShieldAction,
                        for application: Application,
                        completionHandler: @escaping (ShieldActionResponse) -> Void) {
        let coins = shared.piggyCoins

        switch action {
        case .primaryButtonPressed:
            // Peek — 1 minute unlock
            let peekFee = shared.defaultPeekFee
            if coins >= peekFee {
                shared.piggyCoins = coins - peekFee
                shared.lastSyncTime = Date().timeIntervalSince1970
                completionHandler(.close)
            } else {
                completionHandler(.defer)
            }

        case .secondaryButtonPressed:
            // Full unlock
            let fullFee = shared.defaultFullFee
            if coins >= fullFee {
                shared.piggyCoins = coins - fullFee
                shared.lastSyncTime = Date().timeIntervalSince1970
                completionHandler(.close)
            } else {
                completionHandler(.defer)
            }

        @unknown default:
            completionHandler(.defer)
        }
    }

    override func handle(action: ShieldAction,
                        for webDomain: WebDomain,
                        completionHandler: @escaping (ShieldActionResponse) -> Void) {
        completionHandler(.close)
    }
}
