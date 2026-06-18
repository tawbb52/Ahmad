import Foundation
import FirebaseFirestore

struct UserModel: Equatable {
    let id: String
    var name: String
    var email: String
    var profileImageURL: String?
    var bio: String
    var isEmailVerified: Bool
    var authProvider: String
    var createdAt: Date
    var updatedAt: Date

    init(
        id: String,
        name: String,
        email: String,
        profileImageURL: String? = nil,
        bio: String = "",
        isEmailVerified: Bool = false,
        authProvider: String,
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.email = email
        self.profileImageURL = profileImageURL
        self.bio = bio
        self.isEmailVerified = isEmailVerified
        self.authProvider = authProvider
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    init?(id: String, data: [String: Any]) {
        guard let name = data["name"] as? String,
              let email = data["email"] as? String else {
            return nil
        }

        self.id = id
        self.name = name
        self.email = email
        self.profileImageURL = data["profileImageURL"] as? String
        self.bio = data["bio"] as? String ?? ""
        self.isEmailVerified = data["isEmailVerified"] as? Bool ?? false
        self.authProvider = data["authProvider"] as? String ?? "password"
        self.createdAt = UserModel.dateValue(from: data["createdAt"])
        self.updatedAt = UserModel.dateValue(from: data["updatedAt"])
    }

    var dictionaryRepresentation: [String: Any] {
        [
            "name": name,
            "email": email,
            "profileImageURL": profileImageURL as Any,
            "bio": bio,
            "isEmailVerified": isEmailVerified,
            "authProvider": authProvider,
            "createdAt": Timestamp(date: createdAt),
            "updatedAt": Timestamp(date: updatedAt)
        ]
    }

    private static func dateValue(from rawValue: Any?) -> Date {
        switch rawValue {
        case let timestamp as Timestamp:
            return timestamp.dateValue()
        case let date as Date:
            return date
        default:
            return Date()
        }
    }
}
