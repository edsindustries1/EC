# Dispatch integration (app ↔ everywheretrans.com trip log)

App bookings go straight into Everywhere Cars' existing dispatch trip log as waiting jobs. Dispatchers assign cars exactly as they do for phone bookings, and the customer follows the trip live in the app: driver assigned (name, car, plate), arrived, on board, completed, and cancelled or no-show. Fares come from the dispatch system's own fare tables. Payment stays "pay the driver" for now.

```
Customer app ─► app server (Railway) ──signed POST /ec_bridge/*──► EcBridgeController (dispatch, PHP)
                     ▲                                                  │ trip saved like a phone booking
                     │ signed webhook (retries)                         ▼
                     └─────────────── EcBridgeShell (cron) ◄── trip log / driver app status
                app poller (every 60 s) re-checks live trips: safety net
```

The dispatch-side code and its deploy guide live in the dispatch repo on branch `feature/ec-bridge` (`EC_BRIDGE.md`).

## What changed in this repo

| Area | Files |
|---|---|
| Bridge client, signing, sync engine, quote, routes, email | `server/dispatch/*`, `server/emailTemplates/tripUpdate.js`, `server/emailService.js` |
| Wiring (raw body for webhooks, quote, booking, routes, poller) | `server/index.js` |
| Booking columns (`dispatch_state`, `dispatch_legs`, coordinates, `price_source`, `cancelled_at`) | `server/schema.sql`, `server/db-postgres.js` |
| Live trip on the reservation page (status, driver card, map, cancel) | `src/components/LiveTrip.jsx`, `src/components/TileMap.jsx`, `src/pages/Reservation.jsx` |
| Fixed fare on results | `src/pages/SearchResults.jsx` |
| Operator Dispatch page (sync state, send/retry) | `src/pages/operator/Dispatch.jsx`, `src/App.jsx`, `src/components/Navbar.jsx` |
| Local mock dispatch + end-to-end test | `dev/mock-dispatch/*`, `dev/dispatch-demo.sh` |

When `DISPATCH_ENABLED` is not `true`, the app behaves exactly as before.

## Run the demo locally

```
npm run demo:dispatch -- --reset
```

1. Open the trip log mock at http://localhost:4100.
2. Open the app at http://localhost:3001/login and sign in as `customer@test.com` / `customer123`. Then book a sedan, SUV or Sprinter.
3. Within seconds the trip appears in the mock trip log, marked **APP**.
4. In the trip log, type a car number (101, 102, 205, 206 or 310) and press Enter. Then use the driver buttons: Driver accepts → Arrived → Picked up → Complete.
5. Watch the reservation page: the status, driver card and moving map update on their own.
6. Operator view: http://localhost:3001/operator/dispatch as `operator@everywheretransfers.com` / `operator123`.

Automated end-to-end check (with the demo running): `npm run test:dispatch`. It runs 31 checks: quote, round trip, duplicates, the full driver flow, customer and dispatcher cancel, no cancel once the driver has arrived, coach not dispatched, a round trip from an older app build flagged, a reviewer contact email not dispatched, the public lookup hiding dispatch data, forged webhook rejected, and access control.

## Settings (app server)

| Variable | Meaning |
|---|---|
| `DISPATCH_ENABLED` | `true` turns the integration on. Off by default. |
| `DISPATCH_BRIDGE_URL` | Dispatch base URL, for example `https://everywheretrans.com` (staging host first) |
| `DISPATCH_BRIDGE_KEY` / `DISPATCH_BRIDGE_SECRET` | Must match `key_id` / `secret` in the dispatch `ec_bridge.php` |
| `DISPATCH_WEBHOOK_SECRET` | Must match `webhook_secret` there. Required: without it webhooks are refused and status only arrives by polling. |
| `DISPATCH_VEHICLE_TYPES` | Types sent to dispatch (default `sedan,suv,sprinter_van`). Others stay on the operator flow. |
| `DISPATCH_POLL_SECONDS` | Safety-net poll interval (default 60) |
| `DISPATCH_SHOW_DRIVER_PHONE` | `true` shows the driver's phone to customers (default: dispatch number only) |
| `DISPATCH_TEST_EMAILS` | Extra accounts never sent to live dispatch (reviewer/operator/admin are always excluded) |
| `DISPATCH_SEND_TEST_ACCOUNTS` | `true` only on staging or the mock, to let those accounts dispatch |

## Behaviour worth knowing

- **Never lose a booking:** if dispatch is down, the booking is saved and queued. The poller resends it, and duplicates are prevented by the booking reference.
- **Round trips:** two trip-log jobs, `REF` and `REF-R`. The customer can cancel the return leg after riding the outbound.
- **Fare:** the dispatch fare is shown as a fixed fare and written on the trip. If dispatch could not price a trip, the app shows its own estimate and the trip-log fare is left for the dispatcher, as with a phone booking.
- **Cancel:** customers can cancel until the driver has arrived. After that the app tells them to call dispatch. With the integration off there is no in-app cancel, as before.
- **Round trips from older app builds** (no return time): the outbound leg is sent with a ROUND TRIP note, and the booking is flagged on the operator Dispatch page.
- **Quotes:** cached for 5 minutes per route, at most 30 dispatch quotes a minute per visitor, and a 4-second timeout; otherwise the app's own table is used. Production needs the Google key so trips are sent with coordinates.
- **App Store review:** reviewer, operator and admin accounts never create jobs in live dispatch.

## Still to do before going live

1. **Staging copy** of the dispatch system with **sandbox PubNub keys**, then deploy `feature/ec-bridge` there. See `EC_BRIDGE.md`.
2. **Company settings:** fill in `ec_bridge.php`: company id, real cab names, secrets.
3. **Staging run-through** with a test driver phone, using the checklist in `EC_BRIDGE.md`.
4. **Pilot:** turn it on for staff accounts first, then everyone. Brief dispatchers on what APP jobs look like.
5. **Later phases:**
   - push notifications (FCM/APNs; needs a new store build);
   - card payment;
   - Google Static/JS map tiles in place of OpenStreetMap;
   - SMS.
