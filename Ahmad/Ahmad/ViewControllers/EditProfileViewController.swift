import UIKit

final class EditProfileViewController: UIViewController {
    private let viewModel: ProfileViewModel

    private let stackView = UIStackView()
    private let nameField = UITextField()
    private let imageURLField = UITextField()
    private let bioTextView = UITextView()
    private let saveButton = UIButton(type: .system)

    init(viewModel: ProfileViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "تعديل الملف"
        navigationItem.largeTitleDisplayMode = .never
        configureLayout()
        populateFields()
    }

    @objc private func saveTapped() {
        Task {
            do {
                _ = try await viewModel.updateProfile(
                    name: nameField.text ?? "",
                    bio: bioTextView.text ?? "",
                    profileImageURL: imageURLField.text
                )
                showMessage(title: "تم الحفظ", message: "تم تحديث بيانات ملفك الشخصي.") { [weak self] in
                    self?.navigationController?.popViewController(animated: true)
                }
            } catch {
                showError(error)
            }
        }
    }

    private func populateFields() {
        let user = viewModel.user
        nameField.text = user?.name
        imageURLField.text = user?.profileImageURL
        bioTextView.text = user?.bio
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

        [nameField, imageURLField].forEach {
            $0.borderStyle = .roundedRect
            $0.heightAnchor.constraint(equalToConstant: 48).isActive = true
        }
        nameField.placeholder = "الاسم الكامل"
        imageURLField.placeholder = "رابط صورة شخصية HTTPS (اختياري)"
        imageURLField.keyboardType = .URL
        imageURLField.autocapitalizationType = .none

        bioTextView.font = .preferredFont(forTextStyle: .body)
        bioTextView.layer.borderWidth = 1
        bioTextView.layer.borderColor = UIColor.separator.cgColor
        bioTextView.layer.cornerRadius = 12
        bioTextView.heightAnchor.constraint(equalToConstant: 140).isActive = true

        var configuration = UIButton.Configuration.filled()
        configuration.title = "حفظ التغييرات"
        configuration.cornerStyle = .large
        saveButton.configuration = configuration
        saveButton.addTarget(self, action: #selector(saveTapped), for: .touchUpInside)
        saveButton.heightAnchor.constraint(equalToConstant: 52).isActive = true

        [nameField, imageURLField, bioTextView, saveButton].forEach {
            stackView.addArrangedSubview($0)
        }
    }
}
