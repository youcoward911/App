import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    let shared = SharedDefaults.shared

    // Warm coral from mockup C
    private let bgColor = UIColor(red: 0.969, green: 0.702, blue: 0.659, alpha: 1.0) // #F7B3A8
    private let btnPrimary = UIColor(red: 0.878, green: 0.824, blue: 0.722, alpha: 1.0) // warm cream
    private let btnSecondary = UIColor(red: 1.0, green: 0.788, blue: 0.420, alpha: 1.0) // gold #FFC96B
    private let textDark = UIColor(red: 0.494, green: 0.212, blue: 0.180, alpha: 1.0) // #7E362E

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        let peekFee = shared.defaultPeekFee
        let fullFee = shared.defaultFullFee
        let coins = shared.piggyCoins
        let shame = shared.randomShameMessage

        let subtitle: String
        if coins < peekFee {
            subtitle = "\(shame)\n\n\(coins) coins — not enough to peek. Buy more, piggy."
        } else {
            subtitle = "\(shame)\n\n\(coins) coins available"
        }

        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: bgColor,
            icon: nil,
            title: ShieldConfiguration.Label(
                text: "Slop Locked",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: subtitle,
                color: .white
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Peek (2 min) — \(peekFee) coins",
                color: textDark
            ),
            primaryButtonBackgroundColor: .white,
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Full Unlock — \(fullFee) coins",
                color: textDark
            )
        )
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: application)
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        let shame = shared.randomShameMessage

        return ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: bgColor,
            title: ShieldConfiguration.Label(text: "Slop Locked", color: .white),
            subtitle: ShieldConfiguration.Label(text: shame, color: .white),
            primaryButtonLabel: ShieldConfiguration.Label(text: "Close", color: textDark),
            primaryButtonBackgroundColor: .white
        )
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return configuration(shielding: webDomain)
    }
}
