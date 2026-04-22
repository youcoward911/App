import Foundation
import FamilyControls
import ManagedSettings

let APP_GROUP = "group.com.paypig.app"

class SharedDefaults {
    static let shared = SharedDefaults()
    private let defaults: UserDefaults

    private init() {
        defaults = UserDefaults(suiteName: APP_GROUP) ?? .standard
    }

    // MARK: - Coin Balance

    var piggyCoins: Int {
        get { defaults.integer(forKey: "piggyCoins") }
        set { defaults.set(newValue, forKey: "piggyCoins") }
    }

    // MARK: - Fee Settings

    var defaultPeekFee: Int {
        get {
            let val = defaults.integer(forKey: "defaultPeekFee")
            return val > 0 ? val : 1
        }
        set { defaults.set(newValue, forKey: "defaultPeekFee") }
    }

    var defaultFullFee: Int {
        get {
            let val = defaults.integer(forKey: "defaultFullFee")
            return val > 0 ? val : 10
        }
        set { defaults.set(newValue, forKey: "defaultFullFee") }
    }

    // MARK: - App Selection

    func saveSelection(_ selection: FamilyActivitySelection) {
        if let data = try? JSONEncoder().encode(selection) {
            defaults.set(data, forKey: "familyActivitySelection")
        }
    }

    func loadSelection() -> FamilyActivitySelection? {
        guard let data = defaults.data(forKey: "familyActivitySelection") else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    var selectedAppTokens: Set<ApplicationToken> {
        loadSelection()?.applicationTokens ?? []
    }

    var selectedCategoryTokens: Set<ActivityCategoryToken> {
        loadSelection()?.categoryTokens ?? []
    }

    // MARK: - Shame Messages

    var shameMessages: [String] {
        [
            "Oink oink! This app is LOCKED, piggy.",
            "Your master said NO. Pay up or walk away.",
            "Weak. You lasted how long?",
            "Back again? Pathetic.",
            "The trough is closed. Pay the toll.",
            "Squeal all you want. Still locked.",
            "How many times is this now? Disgusting.",
            "You can't even go an hour? Wow.",
        ]
    }

    var randomShameMessage: String {
        shameMessages.randomElement() ?? "Locked."
    }

    // MARK: - Sync flag

    var lastSyncTime: Double {
        get { defaults.double(forKey: "lastSyncTime") }
        set { defaults.set(newValue, forKey: "lastSyncTime") }
    }

    func syncState(coins: Int, peekFee: Int, fullFee: Int) {
        piggyCoins = coins
        defaultPeekFee = peekFee
        defaultFullFee = fullFee
        lastSyncTime = Date().timeIntervalSince1970
    }
}
