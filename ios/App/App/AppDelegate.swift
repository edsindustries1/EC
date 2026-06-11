import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // ─── Force LIGHT interface style + white window background ───────
        // iOS dark mode flips UIColor.systemBackground to BLACK. Capacitor's
        // CAPBridgeViewController uses systemBackground as the WebView
        // backing color when no explicit ios.backgroundColor is set —
        // result: users with dark mode on see BLACK bars in the safe-area
        // gutters around the WebView.
        //
        // We force the whole app to .light style and explicitly paint the
        // root window white. Belt and braces: even if anything pokes
        // through the WebView during animations / orientation changes,
        // it renders white, not black.
        if let w = window {
            w.overrideUserInterfaceStyle = .light
            w.backgroundColor = .white
        }
        // Storyboard may create the window after this method returns —
        // catch it on the next runloop tick too.
        DispatchQueue.main.async { [weak self] in
            if let w = self?.window ?? UIApplication.shared.windows.first {
                w.overrideUserInterfaceStyle = .light
                w.backgroundColor = .white
            }
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationDidBecomeActive(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
