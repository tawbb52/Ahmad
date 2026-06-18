import UIKit

final class SettingsViewController: UIViewController {
    private let settingsViewModel = SettingsViewModel()

    private let stackView = UIStackView()
    private let verificationButton = UIButton(type: .system)
    private let logoutButton = UIButton(type: .system)
    private let descriptionLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "الإعدادات"
        navigationItem.largeTitleDisplayMode = .never
        configureLayout()
    }

    @objc private func verificationTapped() {
        Task {
            do {
                try await settingsViewModel.sendEmailVerification()
                showMessage(title: "تم الإرسال", message: "تحقق من بريدك الإلكتروني لإكمال التوثيق.")
            } catch {
                showError(error)
            }
        }
    }

    @objc private func logoutTapped() {
        do {
            try settingsViewModel.signOut()
            navigationController?.setViewControllers([LoginViewController()], animated: true)
        } catch {
            showError(error)
        }
    }

    private func configureLayout() {
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.axis = .vertical
        stackView.spacing = 16

        view.addSubview(stackView)
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            stackView.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor)
        ])

        descriptionLabel.text = "يمكنك إعادة إرسال رسالة التحقق أو تسجيل الخروج بأمان من هنا."
        descriptionLabel.numberOfLines = 0
        descriptionLabel.textAlignment = .right
        descriptionLabel.textColor = .secondaryLabel

        var verificationConfiguration = UIButton.Configuration.filled()
        verificationConfiguration.title = "إعادة إرسال توثيق البريد"
        verificationConfiguration.cornerStyle = .large
        verificationButton.configuration = verificationConfiguration
        verificationButton.addTarget(self, action: #selector(verificationTapped), for: .touchUpInside)
        verificationButton.heightAnchor.constraint(equalToConstant: 52).isActive = true

        var logoutConfiguration = UIButton.Configuration.gray()
        logoutConfiguration.title = "تسجيل الخروج"
        logoutConfiguration.cornerStyle = .large
        logoutConfiguration.baseForegroundColor = .systemRed
        logoutButton.configuration = logoutConfiguration
        logoutButton.addTarget(self, action: #selector(logoutTapped), for: .touchUpInside)
        logoutButton.heightAnchor.constraint(equalToConstant: 52).isActive = true

        [descriptionLabel, verificationButton, logoutButton].forEach {
            stackView.addArrangedSubview($0)
        }
    }
}
