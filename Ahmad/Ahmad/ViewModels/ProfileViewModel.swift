import Foundation
import FirebaseAuth
import FirebaseFirestore

@MainActor
final class ProfileViewModel {
    private let firebaseManager: FirebaseManager

    private(set) var user: UserModel?

    init(firebaseManager: FirebaseManager = .shared) {
        self.firebaseManager = firebaseManager
    }

    func loadCurrentUserProfile() async throws -> UserModel {
        guard let currentUser = try firebaseManager.auth().currentUser else {
            throw AuthFlowError.userMissing
        }

        let snapshot = try await firebaseManager.usersCollection().document(currentUser.uid).getDocument()
        guard let data = snapshot.data(),
              let user = UserModel(id: currentUser.uid, data: data) else {
            let fallback = UserModel(
                id: currentUser.uid,
                name: currentUser.displayName ?? "مستخدم Ahmad",
                email: currentUser.email ?? "",
                profileImageURL: currentUser.photoURL?.absoluteString,
                bio: "",
                isEmailVerified: currentUser.isEmailVerified,
                authProvider: currentUser.providerData.first?.providerID ?? "password"
            )
            self.user = fallback
            return fallback
        }

        let refreshedUser = UserModel(
            id: user.id,
            name: user.name,
            email: user.email,
            profileImageURL: user.profileImageURL,
            bio: user.bio,
            isEmailVerified: currentUser.isEmailVerified,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        )

        self.user = refreshedUser
        return refreshedUser
    }

    func updateProfile(name: String, bio: String, profileImageURL: String?) async throws -> UserModel {
        guard let currentUser = try firebaseManager.auth().currentUser else {
            throw AuthFlowError.userMissing
        }

        let sanitizedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let sanitizedBio = bio.trimmingCharacters(in: .whitespacesAndNewlines)
        let sanitizedImageURL = profileImageURL?.trimmingCharacters(in: .whitespacesAndNewlines)

        guard sanitizedName.count >= 2 else {
            throw ValidationError.invalidName
        }

        guard sanitizedBio.count <= 160 else {
            throw ValidationError.invalidBio
        }

        if let sanitizedImageURL, !sanitizedImageURL.isEmpty {
            guard let url = URL(string: sanitizedImageURL), url.scheme?.lowercased() == "https" else {
                throw ValidationError.invalidImageURL
            }
        }

        let existing = try await loadCurrentUserProfile()
        let updatedUser = UserModel(
            id: existing.id,
            name: sanitizedName,
            email: existing.email,
            profileImageURL: sanitizedImageURL?.isEmpty == true ? nil : sanitizedImageURL,
            bio: sanitizedBio,
            isEmailVerified: currentUser.isEmailVerified,
            authProvider: existing.authProvider,
            createdAt: existing.createdAt,
            updatedAt: Date()
        )

        try await firebaseManager.usersCollection().document(currentUser.uid).setData(updatedUser.dictionaryRepresentation, merge: true)
        user = updatedUser
        return updatedUser
    }
}
