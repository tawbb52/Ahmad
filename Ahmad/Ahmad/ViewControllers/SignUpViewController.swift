import UIKit

final class SignUpViewController: UIViewController {
    private let viewModel = AuthViewModel()

    private let stackView = UIStackView()
    private let nameField = UITextField()
    private let emailField = UITextField()
    private let passwordField = UITextField()
    private let confirmPasswordField = UITextField()
    private let createButton = UIButton(type: .system)
    private let hintLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "إنشاء حساب"
        navigationItem.largeTitleDisplayMode = .never
        configureLayout()
    }

    @objc private func createTapped() {
        Task {
            do {
                _ = try await viewModel.signUp(
                    name: nameField.text ?? "",
                    email: emailField.text ?? "",
                    password: passwordField.text ?? "",
                    confirmPassword: confirmPasswordField.text ?? ""
                )
                showMessage(
                    title: "تم إنشاء الحساب",
                    message: "تم إرسال رسالة تحقق إلى بريدك الإلكتروني. يمكنك متابعة استخدام التطبيق ثم تأكيد البريد من الإعدادات."
                ) { [weak self] in
                    self?.navigationController?.setViewControllers([ProfileViewController()], animated: true)
                }
            } catch {
                showError(error)
            }
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

        configureTextField(nameField, placeholder: "الاسم الكامل", contentType: .name)
        configureTextField(emailField, placeholder: "البريد الإلكتروني", contentType: .emailAddress)
        emailField.keyboardType = .emailAddress
        emailField.autocapitalizationType = .none
        configureTextField(passwordField, placeholder: "كلمة المرور", contentType: .newPassword)
        passwordField.isSecureTextEntry = true
        configureTextField(confirmPasswordField, placeholder: "تأكيد كلمة المرور", contentType: .newPassword)
        confirmPasswordField.isSecureTextEntry = true

        var configuration = UIButton.Configuration.filled()
        configuration.title = "إنشاء الحساب"
        configuration.cornerStyle = .large
        createButton.configuration = configuration
        createButton.addTarget(self, action: #selector(createTapped), for: .touchUpInside)
        createButton.heightAnchor.constraint(equalToConstant: 52).isActive = true

        hintLabel.text = "سيتم حفظ الاسم والبريد والصورة الشخصية والوصف في Firestore ضمن مجموعة users."
        hintLabel.textColor = .secondaryLabel
        hintLabel.numberOfLines = 0
        hintLabel.textAlignment = .right

        [nameField, emailField, passwordField, confirmPasswordField, createButton, hintLabel].forEach {
            stackView.addArrangedSubview($0)
        }
    }

    private func configureTextField(_ textField: UITextField, placeholder: String, contentType: UITextContentType) {
        textField.borderStyle = .roundedRect
        textField.placeholder = placeholder
        textField.textContentType = contentType
        textField.heightAnchor.constraint(equalToConstant: 48).isActive = true
    }
}
