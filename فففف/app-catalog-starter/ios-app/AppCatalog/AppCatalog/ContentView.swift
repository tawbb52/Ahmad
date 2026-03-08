import SwiftUI

struct ContentView: View {
    @State private var apps: [AppItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView("Loading apps...")
                } else if let errorMessage {
                    VStack(spacing: 12) {
                        Text("Failed to load")
                            .font(.headline)
                        Text(errorMessage)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    List(apps) { app in
                        NavigationLink(value: app) {
                            HStack(spacing: 12) {
                                AsyncImage(url: URL(string: app.iconUrl)) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    Color.gray.opacity(0.2)
                                }
                                .frame(width: 48, height: 48)
                                .clipShape(RoundedRectangle(cornerRadius: 10))

                                VStack(alignment: .leading) {
                                    Text(app.name)
                                        .font(.headline)
                                    Text(app.category)
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .navigationDestination(for: AppItem.self) { app in
                        AppDetailView(app: app)
                    }
                    .refreshable {
                        await loadApps()
                    }
                }
            }
            .navigationTitle("Apps")
            .task {
                await loadApps()
            }
        }
    }

    @MainActor
    private func loadApps() async {
        isLoading = true
        defer { isLoading = false }

        do {
            apps = try await APIClient.shared.fetchApps()
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct AppDetailView: View {
    let app: AppItem

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                AsyncImage(url: URL(string: app.iconUrl)) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Color.gray.opacity(0.2)
                }
                .frame(width: 96, height: 96)
                .clipShape(RoundedRectangle(cornerRadius: 20))

                Text(app.name)
                    .font(.largeTitle.bold())

                Text(app.description)
                    .font(.body)

                LabeledContent("Version", value: app.version)
                LabeledContent("Category", value: app.category)
                LabeledContent("Bundle ID", value: app.bundleId)

                if let url = URL(string: app.websiteUrl) {
                    Link("Open website", destination: url)
                        .buttonStyle(.borderedProminent)
                }
            }
            .padding()
        }
        .navigationTitle(app.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
