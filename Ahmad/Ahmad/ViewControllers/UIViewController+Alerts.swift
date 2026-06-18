import UIKit

extension UIViewController {
    func showMessage(title: String, message: String, completion: (() -> Void)? = nil) {
        let alertController = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alertController.addAction(UIAlertAction(title: "حسناً", style: .default) { _ in
            completion?()
        })
        present(alertController, animated: true)
    }

    func showError(_ error: Error) {
        showMessage(title: "حدث خطأ", message: error.localizedDescription)
    }
}
