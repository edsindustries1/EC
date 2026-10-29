import UIKit
import Capacitor

// iOS 27 requires the scene lifecycle for apps built with its SDK (the app is
// killed at launch without it). The window comes from Main.storyboard via the
// scene manifest in Info.plist; URL and user-activity callbacks that used to
// reach AppDelegate arrive here and go to Capacitor the same way.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard scene is UIWindowScene else { return }
        // Same reason as before in AppDelegate: keep the app light with a white
        // backing so dark mode never shows black bars around the WebView.
        if let w = window {
            w.overrideUserInterfaceStyle = .light
            w.backgroundColor = .white
        }
        if let url = connectionOptions.urlContexts.first?.url {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
        }
        if let activity = connectionOptions.userActivities.first {
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: activity, restorationHandler: { _ in })
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
