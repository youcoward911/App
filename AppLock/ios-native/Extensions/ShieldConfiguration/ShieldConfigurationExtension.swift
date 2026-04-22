import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    let shared = SharedDefaults.shared

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        let peekFee = shared.defaultPeekFee
        let fullFee = shared.defaultFullFee
        let coins = shared.piggyCoins
        let shame = shared.randomShameMessage

        let subtitle: String
        if coins < peekFee {
            subtitle = "\(shame)\n\nYou have \(coins) coins. You can't even afford a peek. Buy more, piggy."
        } else {
            subtitle = "\(shame)\n\nYou have \(coins) coins."
        }

        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: UIColor(red: 1.0, green: 0.94, blue: 0.95, alpha: 1.0),
            icon: nil,
            title: ShieldConfiguration.Label(
                text: "Locked, Piggy",
                color: UIColor.systemPink
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: UIColor.darkGray
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Peek (1 min) — \(peekFee) coins",
                color: UIColor.white
            ),
            primaryButtonBackgroundColor: UIColor.systemPink,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Full Unlock — \(fullFee) coins",
                color: UIColor.systemPink
            )
        )
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: UIColor(red: 1.0, green: 0.94, blue: 0.95, alpha: 1.0),
            title: ShieldConfiguration.Label(text: "Locked, Piggy", color: .systemPink),
            subtitle: ShieldConfiguration.Label(text: shared.randomShameMessage, color: .darkGray),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Close", color: .white),
            primaryButtonBackgroundColor: .systemPink
        )
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }
}
