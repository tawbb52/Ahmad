import UIKit

final class ProfileViewController: UIViewController {
    private let viewModel = ProfileViewModel()

    private let stackView = UIStackView()
    private let avatarView = UIImageView()
    private let nameLabel = UILabel()
    private let emailLabel = UILabel()
    private let verificationLabel = UILabel()
    private let bioLabel = UILabel()
    private let providerLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemGroupedBackground
        title = "الملف الشخصي"
        navigationItem.hidesBackButton = true
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "الإعدادات", style: .plain, target: self, action: #selector(settingsTapped))
        navigationItem.leftBarButtonItem = UIBarButtonItem(title: "تعديل", style: .plain, target: self, action: #selector(editTapped))
        configureLayout()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        Task { await loadProfile() }
    }

    @objc private func settingsTapped() {
        navigationController?.pushViewController(SettingsViewController(), animated: true)
    }

    @objc private func editTapped() {
        navigationController?.pushViewController(EditProfileViewController(viewModel: viewModel), animated: true)
    }

    private func loadProfile() async {
        do {
            let user = try await viewModel.loadCurrentUserProfile()
            render(user: user)
        } catch {
            showError(error)
        }
    }

    private func render(user: UserModel) {
        nameLabel.text = user.name
        emailLabel.text = user.email
        verificationLabel.text = user.isEmailVerified ? "البريد الإلكتروني موثّق ✅" : "البريد الإلكتروني غير موثق بعد"
        verificationLabel.textColor = user.isEmailVerified ? .systemGreen : .systemOrange
        bioLabel.text = user.bio.isEmpty ? "أضف نبذة تعريفية قصيرة عنك من شاشة تعديل الملف الشخصي." : user.bio
        providerLabel.text = "مزود تسجيل الدخول: \(user.authProvider)"

        if let profileImageURL = user.profileImageURL,
           let url = URL(string: profileImageURL),
           url.scheme?.lowercased() == "https" {
            Task {
                do {
                    let (data, _) = try await URLSession.shared.data(from: url)
                    if let image = UIImage(data: data) {
                        avatarView.image = image
                    }
                } catch {
                    avatarView.image = UIImage(systemName: "person.crop.circle.fill")
                }
            }
        } else {
            avatarView.image = UIImage(systemName: "person.crop.circle.fill")
        }
    }

    private func configureLayout() {
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.alignment = .center

        avatarView.translatesAutoresizingMaskIntoConstraints = false
        avatarView.contentMode = .scaleAspectFill
        avatarView.tintColor = .systemBlue
        avatarView.backgroundColor = .secondarySystemBackground
        avatarView.layer.cornerRadius = 50
        avatarView.layer.masksToBounds = true
        avatarView.widthAnchor.constraint(equalToConstant: 100).isActive = true
        avatarView.heightAnchor.constraint(equalToConstant: 100).isActive = true

        [nameLabel, emailLabel, verificationLabel, bioLabel, providerLabel].forEach {
            $0.numberOfLines = 0
            $0.textAlignment = .center
        }

        nameLabel.font = .preferredFont(forTextStyle: .title2)
        emailLabel.textColor = .secondaryLabel
        bioLabel.textColor = .secondaryLabel
        providerLabel.font = .preferredFont(forTextStyle: .footnote)
        providerLabel.textColor = .tertiaryLabel

        let container = UIView()
        container.translatesAutoresizingMaskIntoConstraints = false
        container.backgroundColor = .systemBackground
        container.layer.cornerRadius = 20

        view.addSubview(container)
        container.addSubview(stackView)

        NSLayoutConstraint.activate([
            container.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 24),
            container.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            container.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            stackView.topAnchor.constraint(equalTo: container.topAnchor, constant: 24),
            stackView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -20),
            stackView.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -24)
        ])

        [avatarView, nameLabel, emailLabel, verificationLabel, bioLabel, providerLabel].forEach {
            stackView.addArrangedSubview($0)
        }
    }
}
