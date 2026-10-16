import UIKit
import SwiftUI
import FamilyControls
import React

@objc(AppIconsRowViewManager)
class AppIconsRowViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool { true }

  override func view() -> UIView! {
    return AppIconsRowHostView()
  }
}

class AppIconsRowHostView: UIView {
  private var hostingController: UIHostingController<AnyView>?

  @objc var listId: String = "default" {
    didSet { updateView() }
  }

  @objc var maxIcons: Int = 3 {
    didSet { updateView() }
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

    let key = listId.hasPrefix("blocklist_") ? listId : "blocklist_\(listId)"
    let selection = SharedDefaults.shared.loadSelection(forKey: key) ?? FamilyActivitySelection()
    let swiftUIView = AppIconsRowView(selection: selection, maxIcons: maxIcons)
    let hc = UIHostingController(rootView: AnyView(swiftUIView))
    hc.view.backgroundColor = .clear
    hc.view.frame = bounds
    addSubview(hc.view)
    hostingController = hc
  }
}
