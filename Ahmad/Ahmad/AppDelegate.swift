import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        do {
            try FirebaseManager.shared.ensureConfigured()
        } catch {
            assertionFailure(error.localizedDescription)
        }
        return true
    }
}
