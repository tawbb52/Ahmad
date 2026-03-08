import Foundation

struct AppItem: Identifiable, Codable {
    let id: String
    let name: String
    let bundleId: String
    let version: String
    let description: String
    let iconUrl: String
    let websiteUrl: String
    let category: String
    let createdAt: String
    let updatedAt: String
}
