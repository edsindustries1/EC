# App fit / zoom audit (fix/app-fit-polish)

Method: `npm run build` (VITE_API_BASE_URL = staging) + `vite preview`, Playwright/Chromium with
mobile emulation at 375×667 (SE), 393×852 (15/16), 430×932 (Pro Max), 360×800 (Android), the
Capacitor bridge faked so the **native** layout renders (`body.capacitor-native`, tab bar, back
button), and safe-area insets emulated via CDP. Logged in as customer@test.com (read-only).
17 customer-facing routes per device. Screenshots: `ec-polish-screenshots/before-*` and `after-*`
(not committed, about 25 MB); `ec-polish-screenshots/audit.js` reruns the checks.

| # | Issue (root cause) | Fix | Files |
|---|---|---|---|
| 1 | **Pages stay zoomed in after typing.** iOS zooms the WebView when a control under 16px gets focus and never zooms back out. The 16px rule skipped `select` and date/time inputs (home 13px row, post-ride 14px, book-trip 14px select), and the native viewport allowed scaling. | The native app locks the viewport scale (inline head script, plus a fallback in `initNative`). The 16px rule now covers select/date/time on touch devices. The home compact row opts out (`.ec-compact-input`, native-only, protected by the lock). The website keeps pinch-zoom. | `index.html`, `src/native.js`, `src/index.css`, `src/pages/mobile/MobileHome.jsx` |
| 2 | **Content flush to screen edges** on Book trip, Search, Reservation, Quote, Privacy, Fleet, Services, How it works, route/airport pages, Footer, `<Section>`. An inline `padding: 'Npx 0'` overrode the `px-4` classes, giving 0 side padding. | Inline styles now set only top/bottom padding (26 places). | `src/pages/**`, `src/components/uber.jsx`, `Footer.jsx` |
| 3 | **Titles under the floating back button / Dynamic Island**, and dark status-bar icons invisible over black heroes (Quote, Privacy, Airport, route pages). | `main.ec-has-back` adds a white top band (safe-area + 64px) on native pages that show the back button. `<Page>` top padding is reduced there to avoid doubling. | `src/App.jsx`, `BackButton.jsx`, `index.css` |
| 4 | **Overlays positioned against the page, not the screen.** PageTransition kept `transform: translateY(0)` and `will-change: transform` when idle, making it the containing block for `position: fixed` (Profile sheet, Reservation celebration, Modal). | Transform and will-change are applied only while animating. | `src/components/PageTransition.jsx` |
| 5 | Last rows hidden behind the fixed tab bar on non-`<Page>` tab pages. | `main.ec-has-tabbar` bottom padding (safe-area + 72px). | `App.jsx`, `MobileTabBar.jsx`, `index.css` |
| 6 | Home date/time/pax row truncated at 375pt (time "02:", "2 p…"). | Columns rebalanced (1.4/1.1/0.9) and padding tightened. | `MobileHome.jsx` |
| 7 | Text inflation on rotation; iPhone allowed landscape, where the layouts don't fit. | `text-size-adjust: 100%`. iPhone is portrait-only (iPad unchanged). | `index.css`, `ios/App/App/Info.plist` |
| 8 | Possible sideways scroll from stray wide elements; `100vh` taller than the visible area. | `overflow-x: clip` on html/body/#root/main, `max-width: 100%` on media, `min-h-screen` uses 100dvh. | `index.css` |
| 9 | Tab bar floats over forms while the keyboard is open. | `ec-kb-open` body class from Keyboard events hides the tab bar. | `native.js`, `index.css` |
| 10 | Shell config: zoom was only implicitly off; long-press opened Safari link previews. | `zoomEnabled: false` (iOS + Android), `allowsLinkPreview: false`. Capacitor already sets `scrollView.bounces = false`. | `capacitor.config.json` |

After the fixes the audit reports, at all 4 sizes: no horizontal overflow, no off-screen elements,
no fixed elements inside transforms, and no focusable control under 16px (the exempt home row and
checkboxes aside).

## Needs a real-device check
- Focus each field on Home, Post ride and Book trip on an iPhone and confirm there is no zoom. WKWebView focus-zoom can't be emulated in Chromium.
- iOS-native date/time rendering in the home compact row at SE width.
- Keyboard open/close on Book trip (tab bar hidden) and the scroll-into-view of focused fields.
- Dark-hero pages: confirm the white top band with the back button looks right.
