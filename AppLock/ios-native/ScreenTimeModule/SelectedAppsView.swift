import SwiftUI
import FamilyControls

struct SelectedAppsListView: View {
  let selection: FamilyActivitySelection

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      ForEach(Array(selection.applicationTokens), id: \.self) { token in
        HStack(spacing: 14) {
          Label(token)
            .labelStyle(.iconOnly)
            .scaleEffect(1.6)
            .frame(width: 44, height: 44)
          Label(token)
            .labelStyle(.titleOnly)
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(Color(red: 0.29, green: 0.13, blue: 0.25))
          Spacer()
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
        if token != selection.applicationTokens.sorted(by: { "\($0)" < "\($1)" }).last {
          Divider().padding(.leading, 74)
        }
      }

      ForEach(Array(selection.categoryTokens), id: \.self) { token in
        HStack(spacing: 14) {
          Label(token)
            .labelStyle(.iconOnly)
            .scaleEffect(1.6)
            .frame(width: 44, height: 44)
          Label(token)
            .labelStyle(.titleOnly)
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(Color(red: 0.29, green: 0.13, blue: 0.25))
          Spacer()
          Text("Category")
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(Color(red: 1, green: 0.41, blue: 0.71))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color(red: 1, green: 0.84, blue: 0.92))
            .cornerRadius(6)
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 16)
      }
    }
  }
}
