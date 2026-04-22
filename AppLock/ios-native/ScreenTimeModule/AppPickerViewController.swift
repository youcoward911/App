import UIKit
import SwiftUI
import FamilyControls

// Wraps Apple's FamilyActivityPicker (SwiftUI) in a UIKit view controller
// so we can present it from React Native

class AppPickerViewController: UIHostingController<AppPickerView> {

  init(onSelection: @escaping (FamilyActivitySelection) -> Void) {
    let pickerView = AppPickerView(onSelection: onSelection)
    super.init(rootView: pickerView)
    self.modalPresentationStyle = .pageSheet
  }

  @MainActor required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
}

struct AppPickerView: View {
  @State private var selection = FamilyActivitySelection()
  var onSelection: (FamilyActivitySelection) -> Void

  var body: some View {
    NavigationView {
      VStack {
        Text("Choose apps to lock")
          .font(.headline)
          .padding(.top)

        FamilyActivityPicker(selection: $selection)
          .padding()

        Button(action: {
          onSelection(selection)
          // Dismiss happens automatically
        }) {
          Text("Lock Selected Apps")
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.pink)
            .cornerRadius(14)
        }
        .padding(.horizontal)
        .padding(.bottom)
      }
      .navigationTitle("Scroll Pig")
      .navigationBarTitleDisplayMode(.inline)
    }
  }
}
