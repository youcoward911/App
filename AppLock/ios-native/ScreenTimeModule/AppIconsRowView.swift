import SwiftUI
import FamilyControls

struct AppIconsRowView: View {
  let selection: FamilyActivitySelection
  let maxIcons: Int

  var body: some View {
    let tokens = Array(selection.applicationTokens.prefix(maxIcons))
    let remaining = selection.applicationTokens.count + selection.categoryTokens.count - tokens.count

    HStack(spacing: -8) {
      ForEach(Array(tokens.enumerated()), id: \.element) { index, token in
        Label(token)
          .labelStyle(.iconOnly)
          .scaleEffect(1.4)
          .frame(width: 36, height: 36)
          .background(Color.white)
          .clipShape(RoundedRectangle(cornerRadius: 10))
          .overlay(
            RoundedRectangle(cornerRadius: 10)
              .stroke(Color(red: 0.98, green: 0.89, blue: 0.91), lineWidth: 2)
          )
          .zIndex(Double(maxIcons - index))
      }

      if remaining > 0 {
        Text("+\(remaining)")
          .font(.system(size: 12, weight: .heavy))
          .foregroundColor(Color(red: 0.56, green: 0.38, blue: 0.50))
          .frame(width: 36, height: 36)
          .background(Color.white.opacity(0.85))
          .clipShape(RoundedRectangle(cornerRadius: 10))
          .overlay(
            RoundedRectangle(cornerRadius: 10)
              .stroke(Color(red: 0.98, green: 0.89, blue: 0.91), lineWidth: 2)
          )
      }
    }
  }
}
