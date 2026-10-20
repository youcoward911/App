import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity

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
            defaults.synchronize()
            NSLog("[ScrollPig] saveSelection to key '\(key)': apps=\(selection.applicationTokens.count), categories=\(selection.categoryTokens.count), bytes=\(data.count)")
        } else {
            NSLog("[ScrollPig] saveSelection FAILED to encode for key '\(key)'")
        }
    }

    func loadSelection(forKey key: String) -> FamilyActivitySelection? {
        guard let data = defaults.data(forKey: key) else {
            NSLog("[ScrollPig] loadSelection: no data for key '\(key)'")
            return nil
        }
        let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        NSLog("[ScrollPig] loadSelection key '\(key)': apps=\(selection?.applicationTokens.count ?? -1), categories=\(selection?.categoryTokens.count ?? -1)")
        return selection
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

    // MARK: - Lock State (mirrored from the app so extensions can price, unblock and re-block)

    static let lockActivity = DeviceActivityName("scrollpig.lock")
    static let peekActivity = DeviceActivityName("scrollpig.peek")
    static let peekSeconds: TimeInterval = 2 * 60

    var isLocked: Bool {
        get { defaults.bool(forKey: "isLocked") }
        set { defaults.set(newValue, forKey: "isLocked") }
    }

    // Epoch seconds
    var lockExpiresAt: Double {
        get { defaults.double(forKey: "lockExpiresAt") }
        set { defaults.set(newValue, forKey: "lockExpiresAt") }
    }

    var peekCount: Int {
        get { defaults.integer(forKey: "peekCount") }
        set { defaults.set(newValue, forKey: "peekCount") }
    }

    // Epoch seconds
    var peekExpiresAt: Double {
        get { defaults.double(forKey: "peekExpiresAt") }
        set { defaults.set(newValue, forKey: "peekExpiresAt") }
    }

    // Fees captured when the current lock started (fall back to the defaults)
    var lockPeekFee: Int {
        get {
            let val = defaults.integer(forKey: "lockPeekFee")
            return val > 0 ? val : defaultPeekFee
        }
        set { defaults.set(newValue, forKey: "lockPeekFee") }
    }

    var lockFullFee: Int {
        get {
            let val = defaults.integer(forKey: "lockFullFee")
            return val > 0 ? val : defaultFullFee
        }
        set { defaults.set(newValue, forKey: "lockFullFee") }
    }

    var isPro: Bool {
        get { defaults.bool(forKey: "isPro") }
        set { defaults.set(newValue, forKey: "isPro") }
    }

    // Epoch seconds a free user last tapped the PRO-only Peek button on the block screen
    var proUpsellAt: Double {
        get { defaults.double(forKey: "proUpsellAt") }
        set { defaults.set(newValue, forKey: "proUpsellAt") }
    }

    var showingProUpsell: Bool {
        !isPro && Date().timeIntervalSince1970 - proUpsellAt < 60
    }

    // Epoch seconds the player last tapped a block-screen button they couldn't afford
    var brokeAt: Double {
        get { defaults.double(forKey: "brokeAt") }
        set { defaults.set(newValue, forKey: "brokeAt") }
    }

    var showingBroke: Bool {
        Date().timeIntervalSince1970 - brokeAt < 60
    }

    // Whether the block screen's notifications can be delivered (set by the shield action
    // before it posts one); the shield points to the app instead when they can't
    var notificationsAllowed: Bool {
        get { defaults.bool(forKey: "notificationsAllowed") }
        set { defaults.set(newValue, forKey: "notificationsAllowed") }
    }

    var activeListKeys: [String] {
        get {
            let keys = defaults.stringArray(forKey: "activeListKeys") ?? []
            return keys.isEmpty ? ["blocklist_default"] : keys
        }
        set { defaults.set(newValue, forKey: "activeListKeys") }
    }

    // Matches src/utils/peekPricing.js: first peek free for Pro, then 20%, 30%, 40%…
    // of the full-unlock fee, capped at 100%
    var currentPeekCost: Int {
        if isPro && peekCount == 0 { return 0 }
        let percent = min(100, 10 + 10 * peekCount)
        return max(1, Int((Double(lockFullFee * percent) / 100).rounded()))
    }

    // MARK: - Shielding

    func applyShield(_ store: ManagedSettingsStore) {
        let merged = mergedTokens(forKeys: activeListKeys)
        store.shield.applications = merged.apps.isEmpty ? nil : merged.apps
        store.shield.applicationCategories = merged.categories.isEmpty
            ? nil
            : ShieldSettings.ActivityCategoryPolicy.specific(merged.categories)
    }

    func clearShield(_ store: ManagedSettingsStore) {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
    }

    // DeviceActivity rejects windows shorter than 15 minutes, so a short window is
    // scheduled to have started in the past; intervalDidEnd still fires at `end`.
    func scheduleWindow(_ name: DeviceActivityName, endingAt end: Date) throws {
        let start = min(Date(), end.addingTimeInterval(-(15 * 60 + 5)))
        let comps: Set<Calendar.Component> = [.year, .month, .day, .hour, .minute, .second]
        let schedule = DeviceActivitySchedule(
            intervalStart: Calendar.current.dateComponents(comps, from: start),
            intervalEnd: Calendar.current.dateComponents(comps, from: end),
            repeats: false
        )
        let center = DeviceActivityCenter()
        center.stopMonitoring([name])
        try center.startMonitoring(name, during: schedule)
    }

    func stopWindows(_ names: [DeviceActivityName]) {
        DeviceActivityCenter().stopMonitoring(names)
    }

    // MARK: - Block-screen payments (queued for the app to count toward stats)

    func appendShieldEvent(type: String, cost: Int) {
        var events = defaults.array(forKey: "shieldEvents") as? [[String: Any]] ?? []
        events.append(["type": type, "cost": cost, "at": Date().timeIntervalSince1970 * 1000])
        defaults.set(events, forKey: "shieldEvents")
    }

    func consumeShieldEvents() -> [[String: Any]] {
        let events = defaults.array(forKey: "shieldEvents") as? [[String: Any]] ?? []
        defaults.removeObject(forKey: "shieldEvents")
        return events
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
