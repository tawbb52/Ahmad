import AuthenticationServices
import Foundation
import UIKit

@MainActor
final class AuthViewModel {
    private let authenticationManager: AuthenticationManager

    init(authenticationManager: AuthenticationManager = .shared) {
        self.authenticationManager = authenticationManager
    }

    func signIn(email: String, password: String) async throws -> UserModel {
        try validateEmail(email)
        try validatePassword(password)
        return try await authenticationManager.signIn(email: email, password: password)
    }

    func signUp(name: String, email: String, password: String, confirmPassword: String) async throws -> UserModel {
        let sanitizedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard sanitizedName.count >= 2 else {
            throw ValidationError.invalidName
        }

        try validateEmail(email)
        try validatePassword(password)

        guard password == confirmPassword else {
            throw ValidationError.passwordsDoNotMatch
        }

        return try await authenticationManager.signUp(name: sanitizedName, email: email, password: password)
    }

    func sendPasswordReset(email: String) async throws {
        try validateEmail(email)
        try await authenticationManager.sendPasswordReset(to: email)
    }

    func signInWithGoogle(presentingViewController: UIViewController) async throws -> UserModel {
        try await authenticationManager.signInWithGoogle(presentingViewController: presentingViewController)
    }

    func configureAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        authenticationManager.prepareAppleSignInRequest(request)
    }

    func signInWithApple(authorization: ASAuthorization) async throws -> UserModel {
        try await authenticationManager.signInWithApple(authorization: authorization)
    }

    private func validateEmail(_ email: String) throws {
        let sanitizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let emailRegex = /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        guard sanitizedEmail.wholeMatch(of: emailRegex) != nil else {
            throw ValidationError.invalidEmail
        }
    }

    private func validatePassword(_ password: String) throws {
        guard password.count >= 8 else {
            throw ValidationError.invalidPassword
        }
    }
}

enum ValidationError: LocalizedError {
    case invalidName
    case invalidEmail
    case invalidPassword
    case passwordsDoNotMatch
    case invalidBio
    case invalidImageURL

    var errorDescription: String? {
        switch self {
        case .invalidName:
            return "الاسم يجب أن يحتوي على حرفين على الأقل."
        case .invalidEmail:
            return "أدخل بريدًا إلكترونيًا صحيحًا."
        case .invalidPassword:
            return "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل."
        case .passwordsDoNotMatch:
            return "تأكيد كلمة المرور غير مطابق."
        case .invalidBio:
            return "الوصف الشخصي يجب ألا يتجاوز 160 حرفًا."
        case .invalidImageURL:
            return "رابط الصورة يجب أن يكون HTTPS صالحًا أو اتركه فارغًا."
        }
    }
}
