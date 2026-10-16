import SwiftUI
import DeviceActivity
import React

class DeviceActivityReportHostView: UIView {
    private var hostingController: UIViewController?

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupReport()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupReport()
    }

    private func setupReport() {
        // Filter for today's activity
        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let filter = DeviceActivityFilter(
            segment: .daily(during: DateInterval(start: startOfDay, end: now))
        )

        let reportView = DeviceActivityReport(
            DeviceActivityReport.Context("TotalActivity"),
            filter: filter
        )

        let hostVC = UIHostingController(rootView: reportView)
        hostVC.view.backgroundColor = .clear
        hostVC.view.translatesAutoresizingMaskIntoConstraints = false

        addSubview(hostVC.view)
        NSLayoutConstraint.activate([
            hostVC.view.topAnchor.constraint(equalTo: topAnchor),
            hostVC.view.bottomAnchor.constraint(equalTo: bottomAnchor),
            hostVC.view.leadingAnchor.constraint(equalTo: leadingAnchor),
            hostVC.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        ])

        hostingController = hostVC
    }
}

@objc(DeviceActivityReportViewManager)
class DeviceActivityReportViewManager: RCTViewManager {
    override func view() -> UIView! {
        return DeviceActivityReportHostView()
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
