import AuthenticationServices
import CryptoKit
import FirebaseAuth
import FirebaseCore
import FirebaseFirestore
import Foundation
import GoogleSignIn
import Security
import UIKit

final class AuthenticationManager {
    static let shared = AuthenticationManager()

    private let firebaseManager = FirebaseManager.shared
    private var currentNonce: String?

    private init() {}

    var currentUser: User? {
        try? firebaseManager.auth().currentUser
    }

    func signIn(email: String, password: String) async throws -> UserModel {
        let sanitizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let result = try await firebaseManager.auth().signIn(withEmail: sanitizedEmail, password: password)
        return try await upsertProfile(for: result.user, preferredName: result.user.displayName)
    }

    func signUp(name: String, email: String, password: String) async throws -> UserModel {
        let sanitizedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let sanitizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        let result = try await firebaseManager.auth().createUser(withEmail: sanitizedEmail, password: password)

        let request = result.user.createProfileChangeRequest()
        request.displayName = sanitizedName
        try await request.commitChanges()
        try await result.user.sendEmailVerification()

        return try await upsertProfile(
            for: result.user,
            preferredName: sanitizedName,
            authProvider: "password"
        )
    }

    func sendPasswordReset(to email: String) async throws {
        let sanitizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        try await firebaseManager.auth().sendPasswordReset(withEmail: sanitizedEmail)
    }

    func sendEmailVerification() async throws {
        guard let currentUser else {
            throw AuthFlowError.userMissing
        }

        try await currentUser.sendEmailVerification()
    }

    func signInWithGoogle(presentingViewController: UIViewController) async throws -> UserModel {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            throw AuthFlowError.firebaseConfigurationMissing
        }

        GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
        let signInResult = try await GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController)

        guard let idToken = signInResult.user.idToken?.tokenString else {
            throw AuthFlowError.googleTokenMissing
        }

        let accessToken = signInResult.user.accessToken.tokenString
        let credential = GoogleAuthProvider.credential(withIDToken: idToken, accessToken: accessToken)
        let result = try await firebaseManager.auth().signIn(with: credential)

        return try await upsertProfile(
            for: result.user,
            preferredName: result.user.displayName,
            authProvider: "google"
        )
    }

    func prepareAppleSignInRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = randomNonceString()
        currentNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
    }

    func signInWithApple(authorization: ASAuthorization) async throws -> UserModel {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            throw AuthFlowError.invalidAppleCredential
        }

        guard let nonce = currentNonce else {
            throw AuthFlowError.invalidAppleCredential
        }

        guard let appleIDToken = appleIDCredential.identityToken,
              let idTokenString = String(data: appleIDToken, encoding: .utf8) else {
            throw AuthFlowError.appleTokenMissing
        }

        let credential = OAuthProvider.appleCredential(
            withIDToken: idTokenString,
            rawNonce: nonce,
            fullName: appleIDCredential.fullName
        )

        let result = try await firebaseManager.auth().signIn(with: credential)
        let fullName = [appleIDCredential.fullName?.givenName, appleIDCredential.fullName?.familyName]
            .compactMap { $0 }
            .joined(separator: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)

        return try await upsertProfile(
            for: result.user,
            preferredName: fullName.isEmpty ? result.user.displayName : fullName,
            authProvider: "apple"
        )
    }

    func signOut() throws {
        try firebaseManager.auth().signOut()
        GIDSignIn.sharedInstance.signOut()
        currentNonce = nil
    }

    private func upsertProfile(
        for user: User,
        preferredName: String?,
        authProvider: String? = nil
    ) async throws -> UserModel {
        let documentReference = try firebaseManager.usersCollection().document(user.uid)
        let snapshot = try await documentReference.getDocument()
        let now = Date()
        let displayName = (preferredName?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty == false ? preferredName! : (user.displayName?.isEmpty == false ? user.displayName! : "مستخدم Ahmad"))
        let provider = authProvider ?? user.providerData.first?.providerID ?? "password"

        let currentProfile = snapshot.data().flatMap { UserModel(id: user.uid, data: $0) }
        let model = UserModel(
            id: user.uid,
            name: currentProfile?.name.isEmpty == false ? currentProfile!.name : displayName,
            email: user.email ?? currentProfile?.email ?? "",
            profileImageURL: currentProfile?.profileImageURL ?? user.photoURL?.absoluteString,
            bio: currentProfile?.bio ?? "",
            isEmailVerified: user.isEmailVerified,
            authProvider: currentProfile?.authProvider ?? provider,
            createdAt: currentProfile?.createdAt ?? now,
            updatedAt: now
        )

        try await documentReference.setData(model.dictionaryRepresentation, merge: true)
        return model
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashed = SHA256.hash(data: inputData)
        return hashed.compactMap { String(format: "%02x", $0) }.joined()
    }

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        var result = ""
        var remainingLength = length

        while remainingLength > 0 {
            let randoms: [UInt8] = (0..<16).map { _ in
                var random: UInt8 = 0
                let status = SecRandomCopyBytes(kSecRandomDefault, 1, &random)
                if status != errSecSuccess {
                    fatalError("Unable to generate nonce. SecRandomCopyBytes failed with status \(status)")
                }
                return random
            }

            randoms.forEach { random in
                if remainingLength == 0 {
                    return
                }

                if random < charset.count {
                    result.append(charset[Int(random)])
                    remainingLength -= 1
                }
            }
        }

        return result
    }
}

enum AuthFlowError: LocalizedError {
    case firebaseConfigurationMissing
    case googleTokenMissing
    case appleTokenMissing
    case invalidAppleCredential
    case userMissing

    var errorDescription: String? {
        switch self {
        case .firebaseConfigurationMissing:
            return "إعدادات Firebase غير مكتملة. أضف ملف GoogleService-Info.plist الحقيقي وحدّث القيم البديلة في Info.plist."
        case .googleTokenMissing:
            return "تعذر الحصول على رمز Google الآمن. حاول مرة أخرى."
        case .appleTokenMissing:
            return "تعذر الحصول على رمز Apple الآمن. حاول مرة أخرى."
        case .invalidAppleCredential:
            return "بيانات تسجيل دخول Apple غير صالحة أو انتهت صلاحيتها."
        case .userMissing:
            return "لا يوجد مستخدم مسجل حالياً."
        }
    }
}
