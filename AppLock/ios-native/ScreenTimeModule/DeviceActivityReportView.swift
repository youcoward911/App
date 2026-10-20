import SwiftUI
import DeviceActivity
import React

class DeviceActivityReportHostView: UIView {
    private var hostingController: UIViewController?

    // "TotalActivity" (today's apps) or "TopAppWeek" (the most-used app over the last 7 days)
    @objc var reportContext: NSString = "TotalActivity" {
        didSet { setupReport() }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupReport()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupReport()
    }

    private func setupReport() {
        hostingController?.view.removeFromSuperview()
        hostingController = nil

        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let isWeek = (reportContext as String) == "TopAppWeek"
        // Today for the Stats list; the last 7 days (by day) for the weekly top app
        let start = isWeek ? Calendar.current.date(byAdding: .day, value: -6, to: startOfDay)! : startOfDay
        let filter = DeviceActivityFilter(
            segment: .daily(during: DateInterval(start: start, end: now))
        )

        let reportView = DeviceActivityReport(
            DeviceActivityReport.Context(reportContext as String),
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
