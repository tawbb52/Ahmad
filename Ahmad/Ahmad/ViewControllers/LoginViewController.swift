import AuthenticationServices
import UIKit

final class LoginViewController: UIViewController {
    private let viewModel = AuthViewModel()

    private let scrollView = UIScrollView()
    private let stackView = UIStackView()
    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let emailField = UITextField()
    private let passwordField = UITextField()
    private let signInButton = UIButton(type: .system)
    private let googleButton = UIButton(type: .system)
    private let appleButton = ASAuthorizationAppleIDButton(type: .signIn, style: .black)
    private let forgotPasswordButton = UIButton(type: .system)
    private let createAccountButton = UIButton(type: .system)
    private let loadingIndicator = UIActivityIndicatorView(style: .large)

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "تسجيل الدخول"
        navigationItem.largeTitleDisplayMode = .always
        navigationItem.leftBarButtonItem = UIBarButtonItem(barButtonSystemItem: .close, target: self, action: #selector(closeTapped))
        configureLayout()
    }

    @objc private func closeTapped() {
        dismiss(animated: true)
    }

    @objc private func signInTapped() {
        Task { await performSignIn() }
    }

    @objc private func googleTapped() {
        Task { await performGoogleSignIn() }
    }

    @objc private func forgotPasswordTapped() {
        let alert = UIAlertController(title: "إعادة تعيين كلمة المرور", message: "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.", preferredStyle: .alert)
        alert.addTextField { textField in
            textField.keyboardType = .emailAddress
            textField.textContentType = .emailAddress
            textField.placeholder = "البريد الإلكتروني"
            textField.text = self.emailField.text
        }
        alert.addAction(UIAlertAction(title: "إلغاء", style: .cancel))
        alert.addAction(UIAlertAction(title: "إرسال", style: .default) { [weak self] _ in
            guard let self, let email = alert.textFields?.first?.text else { return }
            Task { await self.performPasswordReset(email: email) }
        })
        present(alert, animated: true)
    }

    @objc private func createAccountTapped() {
        navigationController?.pushViewController(SignUpViewController(), animated: true)
    }

    @objc private func appleTapped() {
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        viewModel.configureAppleRequest(request)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    private func performSignIn() async {
        setLoading(true)
        defer { setLoading(false) }

        do {
            _ = try await viewModel.signIn(email: emailField.text ?? "", password: passwordField.text ?? "")
            routeToProfile()
        } catch {
            showError(error)
        }
    }

    private func performGoogleSignIn() async {
        setLoading(true)
        defer { setLoading(false) }

        do {
            _ = try await viewModel.signInWithGoogle(presentingViewController: self)
            routeToProfile()
        } catch {
            showError(error)
        }
    }

    private func performPasswordReset(email: String) async {
        do {
            try await viewModel.sendPasswordReset(email: email)
            showMessage(title: "تم الإرسال", message: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.")
        } catch {
            showError(error)
        }
    }

    private func routeToProfile() {
        navigationController?.setViewControllers([ProfileViewController()], animated: true)
    }

    private func configureLayout() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        stackView.translatesAutoresizingMaskIntoConstraints = false
        loadingIndicator.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(scrollView)
        view.addSubview(loadingIndicator)
        scrollView.addSubview(stackView)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            stackView.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor, constant: 24),
            stackView.leadingAnchor.constraint(equalTo: view.layoutMarginsGuide.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: view.layoutMarginsGuide.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor, constant: -24),
            stackView.widthAnchor.constraint(equalTo: view.layoutMarginsGuide.widthAnchor),
            loadingIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            loadingIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])

        stackView.axis = .vertical
        stackView.spacing = 16

        titleLabel.text = "مرحباً بعودتك"
        titleLabel.font = .preferredFont(forTextStyle: .largeTitle)
        titleLabel.textAlignment = .right

        subtitleLabel.text = "سجل الدخول باستخدام البريد الإلكتروني أو Google أو Apple."
        subtitleLabel.textColor = .secondaryLabel
        subtitleLabel.numberOfLines = 0
        subtitleLabel.textAlignment = .right

        configureTextField(emailField, placeholder: "البريد الإلكتروني", contentType: .emailAddress)
        emailField.keyboardType = .emailAddress
        emailField.autocapitalizationType = .none

        configureTextField(passwordField, placeholder: "كلمة المرور", contentType: .password)
        passwordField.isSecureTextEntry = true

        configureFilledButton(signInButton, title: "تسجيل الدخول", action: #selector(signInTapped))
        configureOutlineButton(googleButton, title: "متابعة مع Google", action: #selector(googleTapped))
        appleButton.addTarget(self, action: #selector(appleTapped), for: .touchUpInside)
        appleButton.heightAnchor.constraint(equalToConstant: 52).isActive = true

        forgotPasswordButton.setTitle("نسيت كلمة المرور؟", for: .normal)
        forgotPasswordButton.addTarget(self, action: #selector(forgotPasswordTapped), for: .touchUpInside)

        createAccountButton.setTitle("إنشاء حساب جديد", for: .normal)
        createAccountButton.addTarget(self, action: #selector(createAccountTapped), for: .touchUpInside)

        [titleLabel, subtitleLabel, emailField, passwordField, signInButton, googleButton, appleButton, forgotPasswordButton, createAccountButton].forEach {
            stackView.addArrangedSubview($0)
        }
    }

    private func configureTextField(_ textField: UITextField, placeholder: String, contentType: UITextContentType) {
        textField.translatesAutoresizingMaskIntoConstraints = false
        textField.borderStyle = .roundedRect
        textField.placeholder = placeholder
        textField.textContentType = contentType
        textField.heightAnchor.constraint(equalToConstant: 48).isActive = true
    }

    private func configureFilledButton(_ button: UIButton, title: String, action: Selector) {
        var configuration = UIButton.Configuration.filled()
        configuration.title = title
        configuration.cornerStyle = .large
        configuration.baseBackgroundColor = .systemBlue
        button.configuration = configuration
        button.addTarget(self, action: action, for: .touchUpInside)
        button.heightAnchor.constraint(equalToConstant: 52).isActive = true
    }

    private func configureOutlineButton(_ button: UIButton, title: String, action: Selector) {
        var configuration = UIButton.Configuration.gray()
        configuration.title = title
        configuration.cornerStyle = .large
        button.configuration = configuration
        button.addTarget(self, action: action, for: .touchUpInside)
        button.heightAnchor.constraint(equalToConstant: 52).isActive = true
    }

    private func setLoading(_ isLoading: Bool) {
        signInButton.isEnabled = !isLoading
        googleButton.isEnabled = !isLoading
        appleButton.isEnabled = !isLoading
        forgotPasswordButton.isEnabled = !isLoading
        createAccountButton.isEnabled = !isLoading
        isLoading ? loadingIndicator.startAnimating() : loadingIndicator.stopAnimating()
    }
}

extension LoginViewController: ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        view.window ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        Task {
            setLoading(true)
            defer { setLoading(false) }
            do {
                _ = try await viewModel.signInWithApple(authorization: authorization)
                routeToProfile()
            } catch {
                showError(error)
            }
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        showError(error)
    }
}
