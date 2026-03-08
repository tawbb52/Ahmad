import Foundation

final class APIClient {
    static let shared = APIClient()
    private init() {}

    // غيّر هذا الرابط عند تشغيله على جهاز حقيقي أو حسب بيئتك
    private let baseURL = URL(string: "http://localhost:4000")!

    func fetchApps() async throws -> [AppItem] {
        let url = baseURL.appendingPathComponent("apps")
        let (data, response) = try await URLSession.shared.data(from: url)

        guard let httpResponse = response as? HTTPURLResponse,
              200..<300 ~= httpResponse.statusCode else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode([AppItem].self, from: data)
    }
}
