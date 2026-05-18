import Foundation
import React
import FamilyControls
import ManagedSettings
import DeviceActivity

@objc(ScreenTimeModule)
class ScreenTimeModule: RCTEventEmitter {

  private let center = AuthorizationCenter.shared
  private let store = ManagedSettingsStore()
  private let shared = SharedDefaults.shared

  override static func moduleName() -> String! {
    return "ScreenTimeModule"
  }

  override func supportedEvents() -> [String]! {
    return ["onAuthorizationChange", "onAppSelectionChange"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  // MARK: - Authorization

  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        try await center.requestAuthorization(for: .individual)
        resolve(["status": "approved"])
      } catch {
        reject("AUTH_ERROR", "Screen Time authorization failed: \(error.localizedDescription)", error)
      }
    }
  }

  @objc
  func getAuthorizationStatus(_ resolve: RCTPromiseResolveBlock,
                               rejecter reject: RCTPromiseRejectBlock) {
    let status: String
    switch center.authorizationStatus {
    case .notDetermined:
      status = "notDetermined"
    case .approved:
      status = "approved"
    case .denied:
      status = "denied"
    @unknown default:
      status = "unknown"
    }
    resolve(["status": status])
  }

  // MARK: - App Picker (default list)

  @objc
  func showAppPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    showAppPickerForList("blocklist_default", resolve: resolve, rejecter: reject)
  }

  // MARK: - App Picker (specific list)

  @objc
  func showAppPickerForList(_ listId: String,
                            resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      guard let rootVC = UIApplication.shared.windows.first?.rootViewController else {
        reject("NO_ROOT_VC", "Could not find root view controller", nil)
        return
      }

      // Find the topmost presented VC
      var topVC = rootVC
      while let presented = topVC.presentedViewController {
        topVC = presented
      }

      let picker = AppPickerViewController { [weak self] selection in
        guard let self = self else { return }

        let key = listId.hasPrefix("blocklist_") ? listId : "blocklist_\(listId)"
        self.shared.saveSelection(selection, forKey: key)

        let count = selection.applicationTokens.count + selection.categoryTokens.count

        DispatchQueue.main.async {
          topVC.dismiss(animated: true) {
            resolve(["selectedCount": count])
          }
        }
      }

      topVC.present(picker, animated: true)
    }
  }

  // MARK: - Blocking / Shielding

  @objc
  func blockSelectedApps(_ resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) {
    let apps = shared.selectedAppTokens
    let categories = shared.selectedCategoryTokens

    store.shield.applications = apps.isEmpty ? nil : apps
    store.shield.applicationCategories = categories.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(categories)

    let count = apps.count + categories.count
    resolve(["blockedCount": count])
  }

  // Block multiple lists merged together
  @objc
  func blockLists(_ listIds: [String],
                  resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) {
    let keys = listIds.map { $0.hasPrefix("blocklist_") ? $0 : "blocklist_\($0)" }
    let merged = shared.mergedTokens(forKeys: keys)

    store.shield.applications = merged.apps.isEmpty ? nil : merged.apps
    store.shield.applicationCategories = merged.categories.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(merged.categories)

    let count = merged.apps.count + merged.categories.count
    resolve(["blockedCount": count])
  }

  @objc
  func unblockApp(_ appTokenString: String,
                  resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) {
    store.shield.applications = nil
    store.shield.applicationCategories = nil
    resolve(["status": "unblocked"])
  }

  @objc
  func reblockAllApps(_ resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    let apps = shared.selectedAppTokens
    let categories = shared.selectedCategoryTokens

    store.shield.applications = apps.isEmpty ? nil : apps
    store.shield.applicationCategories = categories.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(categories)
    resolve(["status": "blocked"])
  }

  @objc
  func clearAllBlocks(_ resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    store.clearAllSettings()
    resolve(["status": "cleared"])
  }

  // MARK: - Delete a block list

  @objc
  func deleteBlockList(_ listId: String,
                       resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    let key = listId.hasPrefix("blocklist_") ? listId : "blocklist_\(listId)"
    shared.deleteSelection(forKey: key)
    resolve(["status": "deleted"])
  }

  // MARK: - Scheduled Locks

  @objc
  func createSchedule(_ scheduleId: String,
                      startHour: Int,
                      startMinute: Int,
                      endHour: Int,
                      endMinute: Int,
                      resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    let activityCenter = DeviceActivityCenter()

    var startComponents = DateComponents()
    startComponents.hour = startHour
    startComponents.minute = startMinute

    var endComponents = DateComponents()
    endComponents.hour = endHour
    endComponents.minute = endMinute

    let schedule = DeviceActivitySchedule(
      intervalStart: startComponents,
      intervalEnd: endComponents,
      repeats: true
    )

    do {
      let activityName = DeviceActivityName("scrollpig.schedule.\(scheduleId)")
      try activityCenter.startMonitoring(activityName, during: schedule)
      resolve(["status": "scheduled", "scheduleId": scheduleId])
    } catch {
      reject("SCHEDULE_ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func deleteSchedule(_ scheduleId: String,
                      resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) {
    let activityCenter = DeviceActivityCenter()
    let activityName = DeviceActivityName("scrollpig.schedule.\(scheduleId)")
    activityCenter.stopMonitoring([activityName])
    resolve(["status": "deleted"])
  }

  // MARK: - Legacy Monitoring

  @objc
  func startMonitoring(_ durationMinutes: Int,
                       resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    let activityCenter = DeviceActivityCenter()
    let now = Date()
    guard let end = Calendar.current.date(byAdding: .minute, value: durationMinutes, to: now) else {
      reject("SCHEDULE_ERROR", "Could not compute end time", nil)
      return
    }

    let schedule = DeviceActivitySchedule(
      intervalStart: Calendar.current.dateComponents([.hour, .minute, .second], from: now),
      intervalEnd: Calendar.current.dateComponents([.hour, .minute, .second], from: end),
      repeats: false
    )

    do {
      try activityCenter.startMonitoring(.init("scrollpig.lock"), during: schedule)
      resolve(["status": "monitoring", "durationMinutes": durationMinutes])
    } catch {
      reject("MONITOR_ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func stopMonitoring(_ resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    let activityCenter = DeviceActivityCenter()
    activityCenter.stopMonitoring([.init("scrollpig.lock")])
    resolve(["status": "stopped"])
  }

  // MARK: - App Group Sync

  @objc
  func syncToAppGroup(_ coins: Int,
                      peekFee: Int,
                      fullFee: Int,
                      resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) {
    shared.syncState(coins: coins, peekFee: peekFee, fullFee: fullFee)
    resolve(["status": "synced"])
  }

  @objc
  func syncFromAppGroup(_ resolve: RCTPromiseResolveBlock,
                         rejecter reject: RCTPromiseRejectBlock) {
    resolve([
      "piggyCoins": shared.piggyCoins,
      "defaultPeekFee": shared.defaultPeekFee,
      "defaultFullFee": shared.defaultFullFee,
      "lastSyncTime": shared.lastSyncTime,
    ])
  }
}
