import Foundation
import React
import FamilyControls
import ManagedSettings
import DeviceActivity

// MARK: - Authorization Center
// Handles requesting Screen Time permission from the user

@objc(ScreenTimeModule)
class ScreenTimeModule: RCTEventEmitter {

  private let center = AuthorizationCenter.shared
  private let store = ManagedSettingsStore()
  private var selectedApps: Set<ApplicationToken> = []
  private var selectedCategories: Set<ActivityCategoryToken> = []

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

  /// Request Screen Time authorization from the user
  /// This shows Apple's native permission dialog
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

  /// Check current authorization status
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

  // MARK: - App Picker

  /// Show the FamilyActivityPicker so user can select which apps to block
  /// This uses Apple's native picker — we can't see app names, only tokens
  @objc
  func showAppPicker(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      // The FamilyActivityPicker is a SwiftUI view — we present it
      // via a hosting controller from the root view controller
      guard let rootVC = UIApplication.shared.windows.first?.rootViewController else {
        reject("NO_ROOT_VC", "Could not find root view controller", nil)
        return
      }

      let picker = AppPickerViewController { [weak self] selection in
        guard let self = self else { return }
        self.selectedApps = selection.applicationTokens
        self.selectedCategories = selection.categoryTokens
        let count = selection.applicationTokens.count + selection.categoryTokens.count
        resolve(["selectedCount": count])
      }

      rootVC.present(picker, animated: true)
    }
  }

  // MARK: - Blocking / Shielding

  /// Block all currently selected apps by applying a shield overlay
  /// Users will see a "restricted" screen when they try to open blocked apps
  @objc
  func blockSelectedApps(_ resolve: RCTPromiseResolveBlock,
                          rejecter reject: RCTPromiseRejectBlock) {
    store.shield.applications = selectedApps.isEmpty ? nil : selectedApps
    store.shield.applicationCategories = selectedCategories.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(selectedCategories)

    let count = selectedApps.count + selectedCategories.count
    resolve(["blockedCount": count])
  }

  /// Unblock a specific app (called when user pays coins to unlock)
  /// We rebuild the shield set without the unblocked app token
  @objc
  func unblockApp(_ appTokenString: String,
                  resolve: RCTPromiseResolveBlock,
                  rejecter reject: RCTPromiseRejectBlock) {
    // Remove from selected set
    // Note: In practice you'd store tokens mapped to app identifiers
    // For now, we unshield all apps temporarily
    store.shield.applications = nil
    store.shield.applicationCategories = nil
    resolve(["status": "unblocked"])
  }

  /// Reblock all apps (called when user relocks)
  @objc
  func reblockAllApps(_ resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    store.shield.applications = selectedApps.isEmpty ? nil : selectedApps
    store.shield.applicationCategories = selectedCategories.isEmpty
      ? nil
      : ShieldSettings.ActivityCategoryPolicy.specific(selectedCategories)
    resolve(["status": "blocked"])
  }

  /// Clear all shields — unblock everything
  @objc
  func clearAllBlocks(_ resolve: RCTPromiseResolveBlock,
                       rejecter reject: RCTPromiseRejectBlock) {
    store.clearAllSettings()
    selectedApps.removeAll()
    selectedCategories.removeAll()
    resolve(["status": "cleared"])
  }
}
