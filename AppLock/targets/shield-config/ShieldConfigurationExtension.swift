import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    let shared = SharedDefaults.shared

    // App colors: light pink background, dark ink text, logo-pink primary button
    private let bgColor = UIColor(red: 0.961, green: 0.800, blue: 0.835, alpha: 1.0) // #F5CCD5
    private let pink = UIColor(red: 0.969, green: 0.627, blue: 0.698, alpha: 1.0) // #F7A0B2
    private let ink = UIColor(red: 0.176, green: 0.176, blue: 0.176, alpha: 1.0) // #2D2D2D

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        let peekCost = shared.currentPeekCost
        let fullFee = shared.lockFullFee
        let coins = shared.piggyCoins
        let shame = shared.randomShameMessage

        let unlockLabel = ShieldConfiguration.Label(text: "Full Unlock — \(fullFee) coins", color: ink)
        let brokeTitle = ShieldConfiguration.Label(text: "Too Broke, Piggy", color: ink)
        // Point to the notification when one was sent, otherwise to the app itself
        let buyMore = shared.notificationsAllowed ? "Tap the notification to buy more." : "Open Scroll Pig to buy more coins."
        let upgrade = shared.notificationsAllowed ? "Tap the notification to upgrade, piggy." : "Open Scroll Pig to upgrade, piggy."
        let brokeSubtitle = "You have \(coins) coins. A full unlock costs \(fullFee).\n\n\(buyMore)"

        // Peeking is Pro-only: free users see a PRO-tagged Peek that opens an upsell
        guard shared.isPro else {
            let subtitle: String
            if shared.showingBroke {
                subtitle = brokeSubtitle
            } else if shared.showingProUpsell {
                subtitle = "Peek mode is available with Scroll Pig PRO.\n\n\(upgrade)"
            } else if coins < fullFee {
                subtitle = "\(shame)\n\n\(coins) coins — not enough to unlock. Buy more, piggy."
            } else {
                subtitle = "\(shame)\n\n\(coins) coins available"
            }
            return ShieldConfiguration(
                backgroundBlurStyle: nil,
                backgroundColor: bgColor,
                icon: nil,
                title: shared.showingBroke ? brokeTitle : ShieldConfiguration.Label(text: shared.showingProUpsell ? "PRO Pigs Only" : "Slop Locked", color: ink),
                subtitle: ShieldConfiguration.Label(text: subtitle, color: ink),
                primaryButtonLabel: ShieldConfiguration.Label(
                    text: shared.showingProUpsell ? "Upgrade to PRO" : "Peek (2 min) — PRO",
                    color: .white
                ),
                primaryButtonBackgroundColor: pink,
                secondaryButtonLabel: unlockLabel
            )
        }

        let subtitle: String
        if shared.showingBroke {
            subtitle = "You have \(coins) coins. A peek costs \(peekCost), a full unlock \(fullFee).\n\n\(buyMore)"
        } else if coins < peekCost {
            subtitle = "\(shame)\n\n\(coins) coins — not enough to peek. Buy more, piggy."
        } else {
            subtitle = "\(shame)\n\n\(coins) coins available"
        }

        return ShieldConfiguration(
            backgroundBlurStyle: nil,
            backgroundColor: bgColor,
            icon: nil,
            title: shared.showingBroke ? brokeTitle : ShieldConfiguration.Label(
                text: "Slop Locked",
                color: ink
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: ink
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: peekCost == 0 ? "Peek (2 min) — free" : "Peek (2 min) — \(peekCost) coins",
                color: .white
            ),
            primaryButtonBackgroundColor: pink,
            secondaryButtonLabel: unlockLabel
        )
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        let shame = shared.randomShameMessage

        return ShieldConfiguration(
            backgroundBlurStyle: nil,
            backgroundColor: bgColor,
            title: ShieldConfiguration.Label(text: "Slop Locked", color: ink),
            subtitle: ShieldConfiguration.Label(text: shame, color: ink),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Close", color: .white),
            primaryButtonBackgroundColor: pink
        )
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }
}
