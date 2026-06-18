import UIKit

final class ViewController: UIViewController {
    @IBOutlet private weak var welcomeLabel: UILabel!
    @IBOutlet private weak var descriptionLabel: UILabel!
    @IBOutlet private weak var getStartedButton: UIButton!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Ahmad"
        navigationController?.navigationBar.prefersLargeTitles = true
        welcomeLabel.text = "مرحباً بك في Ahmad"
        descriptionLabel.text = "سجّل دخولك أو أنشئ حسابًا جديدًا للوصول إلى ملفك الشخصي وإعداداتك الآمنة عبر Firebase."
        getStartedButton.configuration?.cornerStyle = .large
    }

    @IBAction private func getStartedTapped(_ sender: UIButton) {
        let rootViewController: UIViewController
        if AuthenticationManager.shared.currentUser == nil {
            rootViewController = LoginViewController()
        } else {
            rootViewController = ProfileViewController()
        }

        let navigationController = UINavigationController(rootViewController: rootViewController)
        navigationController.modalPresentationStyle = .fullScreen
        present(navigationController, animated: true)
    }
}
