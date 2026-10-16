import UIKit
import SwiftUI
import FamilyControls
import React

@objc(SelectedAppsViewManager)
class SelectedAppsViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool { true }

  override func view() -> UIView! {
    return SelectedAppsHostView()
  }
}

class SelectedAppsHostView: UIView {
  private var hostingController: UIHostingController<AnyView>?
  private var listKey: String = "blocklist_default"

  @objc var listId: String = "default" {
    didSet {
      listKey = listId.hasPrefix("blocklist_") ? listId : "blocklist_\(listId)"
      updateView()
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }

  private func updateView() {
    hostingController?.view.removeFromSuperview()
    hostingController = nil

    let selection = SharedDefaults.shared.loadSelection(forKey: listKey) ?? FamilyActivitySelection()
    let swiftUIView = SelectedAppsListView(selection: selection)
    let hc = UIHostingController(rootView: AnyView(swiftUIView))
    hc.view.backgroundColor = .clear
    hc.view.frame = bounds
    addSubview(hc.view)
    hostingController = hc
  }
}
