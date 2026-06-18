import Foundation
import FirebaseAuth
import FirebaseCore
import FirebaseFirestore

final class FirebaseManager {
    static let shared = FirebaseManager()

    private init() {}

    func ensureConfigured() throws {
        guard FirebaseApp.app() == nil else {
            return
        }

        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
            throw AuthFlowError.firebaseConfigurationMissing
        }

        FirebaseApp.configure()
    }

    func auth() throws -> Auth {
        try ensureConfigured()
        return Auth.auth()
    }

    func firestore() throws -> Firestore {
        try ensureConfigured()
        return Firestore.firestore()
    }

    func usersCollection() throws -> CollectionReference {
        try firestore().collection("users")
    }
}
