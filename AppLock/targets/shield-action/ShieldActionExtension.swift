import Foundation
import ManagedSettings
import ManagedSettingsUI
import UserNotifications

class ShieldActionExtension: ShieldActionDelegate {
    let shared = SharedDefaults.shared
    let store = ManagedSettingsStore()

    override func handle(action: ShieldAction,
                         for application: ApplicationToken,
                         completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handlePayment(action, completionHandler: completionHandler)
    }

    override func handle(action: ShieldAction,
                         for category: ActivityCategoryToken,
                         completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handlePayment(action, completionHandler: completionHandler)
    }

    override func handle(action: ShieldAction,
                         for webDomain: WebDomainToken,
                         completionHandler: @escaping (ShieldActionResponse) -> Void) {
        completionHandler(.close)
    }

    private func handlePayment(_ action: ShieldAction,
                               completionHandler: @escaping (ShieldActionResponse) -> Void) {
        let coins = shared.piggyCoins

        let isPeek: Bool
        switch action {
        case .primaryButtonPressed: isPeek = true
        case .secondaryButtonPressed: isPeek = false
        @unknown default:
            completionHandler(.none)
            return
        }

        if isPeek && !shared.isPro {
            // Peek is PRO-only. A shield can't open the app, so post a notification
            // that opens the paywall and redraw the shield with the upsell message.
            shared.proUpsellAt = Date().timeIntervalSince1970
            let content = UNMutableNotificationContent()
            content.title = "Peek mode is a PRO feature 🐷"
            content.body = "Tap to upgrade to Scroll Pig PRO and peek for 2 minutes."
            content.sound = .default
            content.userInfo = ["screen": "Paywall"]
            notifyThenRedraw(content, id: "scrollpig.pro-upsell", completionHandler)
        } else if isPeek {
            // Peek — unblock for 2 minutes, then the monitor extension re-blocks
            let cost = shared.currentPeekCost
            NSLog("[ScrollPig] shield peek: coins=\(coins) cost=\(cost)")
            guard coins >= cost else {
                tooBroke(completionHandler)
                return
            }
            let end = Date().addingTimeInterval(SharedDefaults.peekSeconds)
            shared.piggyCoins = coins - cost
            shared.peekCount += 1
            shared.peekExpiresAt = end.timeIntervalSince1970
            shared.appendShieldEvent(type: "peek", cost: cost)
            do {
                try shared.scheduleWindow(SharedDefaults.peekActivity, endingAt: end)
            } catch {
                NSLog("[ScrollPig] peek schedule failed: \(error)")
            }
            shared.clearShield(store)
            completionHandler(.defer)
        } else {
            // Full unlock — end the lock
            let cost = shared.lockFullFee
            NSLog("[ScrollPig] shield full unlock: coins=\(coins) cost=\(cost)")
            guard coins >= cost else {
                tooBroke(completionHandler)
                return
            }
            shared.piggyCoins = coins - cost
            shared.isLocked = false
            shared.peekCount = 0
            shared.peekExpiresAt = 0
            shared.appendShieldEvent(type: "unlock", cost: cost)
            shared.stopWindows([SharedDefaults.lockActivity, SharedDefaults.peekActivity])
            shared.clearShield(store)
            completionHandler(.defer)
        }
    }

    // A shield can't show alerts: redraw it with a "too broke" message and send a
    // notification that opens the coin shop, instead of silently doing nothing
    private func tooBroke(_ completionHandler: @escaping (ShieldActionResponse) -> Void) {
        shared.brokeAt = Date().timeIntervalSince1970
        let content = UNMutableNotificationContent()
        content.title = "Too broke, piggy 🐷"
        content.body = "You need more coins for that. Tap to top up."
        content.sound = .default
        content.userInfo = ["screen": "CoinShop"]
        notifyThenRedraw(content, id: "scrollpig.too-broke", completionHandler)
    }

    // Records whether notifications can be shown (so the shield's text says "tap the
    // notification" or "open Scroll Pig"), posts it if so, then redraws the shield
    private func notifyThenRedraw(_ content: UNMutableNotificationContent, id: String,
                                  _ completionHandler: @escaping (ShieldActionResponse) -> Void) {
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            let allowed = settings.authorizationStatus == .authorized
                || settings.authorizationStatus == .provisional
                || settings.authorizationStatus == .ephemeral
            self.shared.notificationsAllowed = allowed
            if allowed {
                center.add(UNNotificationRequest(identifier: id, content: content, trigger: nil))
            }
            completionHandler(.defer)
        }
    }
}
