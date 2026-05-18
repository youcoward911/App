import Foundation
import FamilyControls
import ManagedSettings

let APP_GROUP = "group.com.paypig.app"

class SharedDefaults {
    static let shared = SharedDefaults()
    private let defaults: UserDefaults

    private init() {
        defaults = UserDefaults(suiteName: APP_GROUP) ?? .standard
        migrateOldSelection()
    }

    // MARK: - Migration

    private func migrateOldSelection() {
        // Migrate old single-key selection to multi-list format
        if let data = defaults.data(forKey: "familyActivitySelection"),
           defaults.data(forKey: "blocklist_default") == nil {
            defaults.set(data, forKey: "blocklist_default")
            defaults.removeObject(forKey: "familyActivitySelection")
        }
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

    // MARK: - Block List Selections (multi-list)

    func saveSelection(_ selection: FamilyActivitySelection, forKey key: String) {
        if let data = try? JSONEncoder().encode(selection) {
            defaults.set(data, forKey: key)
        }
    }

    func loadSelection(forKey key: String) -> FamilyActivitySelection? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
    }

    func deleteSelection(forKey key: String) {
        defaults.removeObject(forKey: key)
    }

    func mergedTokens(forKeys keys: [String]) -> (apps: Set<ApplicationToken>, categories: Set<ActivityCategoryToken>) {
        var apps = Set<ApplicationToken>()
        var categories = Set<ActivityCategoryToken>()
        for key in keys {
            if let selection = loadSelection(forKey: key) {
                apps.formUnion(selection.applicationTokens)
                categories.formUnion(selection.categoryTokens)
            }
        }
        return (apps, categories)
    }

    // Backward compat — default list
    var selectedAppTokens: Set<ApplicationToken> {
        loadSelection(forKey: "blocklist_default")?.applicationTokens ?? []
    }

    var selectedCategoryTokens: Set<ActivityCategoryToken> {
        loadSelection(forKey: "blocklist_default")?.categoryTokens ?? []
    }

    // Legacy single-key save (for onboarding)
    func saveSelection(_ selection: FamilyActivitySelection) {
        saveSelection(selection, forKey: "blocklist_default")
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
