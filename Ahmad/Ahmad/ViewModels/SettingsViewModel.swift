import Foundation

@MainActor
final class SettingsViewModel {
    private let authenticationManager: AuthenticationManager

    init(authenticationManager: AuthenticationManager = .shared) {
        self.authenticationManager = authenticationManager
    }

    func sendEmailVerification() async throws {
        try await authenticationManager.sendEmailVerification()
    }

    func signOut() throws {
        try authenticationManager.signOut()
    }
}
