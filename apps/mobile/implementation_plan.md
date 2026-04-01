# Implement Keycloak OpenID Connect Flow

We need to complete the authentication flow so the Flutter app can actually log in, obtain access tokens, and make authenticated requests to the backend API.

## User Review Required
> [!IMPORTANT]
> The current redirect URI in [config.dart](file:///c:/Users/igari/.gemini/antigravity/scratch/flutter_auth_app/lib/utils/config.dart) (`com.example.flutterauthapp://callback`) and [auth_service.dart](file:///c:/Users/igari/.gemini/antigravity/scratch/flutter_auth_app/lib/services/auth_service.dart) (`http://localhost:8020/exclient/auth/callback`) differ, and neither is fully implemented to capture the OAuth result. 
> 
> **Question 1**: Are we targeting Mobile (Android/iOS) or Desktop (Windows) primarily during this testing phase? 
> - If Desktop, `openid_client` can stand up a local server to catch the callback on a specific localhost port. (Keycloak needs to be configured with `http://localhost:[port]/` as a valid Redirect URI).
> - If Mobile, we will need to configure `android/app/src/main/AndroidManifest.xml` to capture the custom scheme `com.example.flutterauthapp://callback` using deep linking, and possibly replace desktop implementations.
>
> **Question 2**: Is the backend API running on `http://10.0.2.2:8020` right now? (This is correct for the Android Emulator to connect to a host machine. If testing natively on Windows Desktop, it needs to be `http://localhost:8020`).

## Proposed Changes

### [MODIFY] lib/services/auth_service.dart
Update the [login()](file:///c:/Users/igari/.gemini/antigravity/scratch/flutter_auth_app/lib/services/auth_service.dart#8-35) function to properly use `openid_client` and `url_launcher`.
1. Discover Keycloak issuer via `Issuer.discover()`.
2. Initialize `Client`.
3. Leverage the correct `Authenticator` to launch the Keycloak login in the browser/webview.
4. Capture the redirect callback and parse the credentials (tokens).
5. Save `accessToken`, `idToken`, and `refreshToken` using [SecureStorageService](file:///c:/Users/igari/.gemini/antigravity/scratch/flutter_auth_app/lib/services/storage_service.dart#3-30).
6. Return `true` to signal login success.

### [MODIFY] android/app/src/main/AndroidManifest.xml (if targeting mobile)
Add an `<intent-filter>` to capture the custom URI redirect from Keycloak when the user logs in on Android.

### [MODIFY] lib/utils/config.dart
Standardize `AppConfig.keycloakRedirectUri` based on the requested target platform.

## Verification Plan
1. Compile and run the Flutter application (`flutter run`).
2. Click "Login with Keycloak" on the Login screen.
3. Verify Keycloak login page appears, and fill in credentials.
4. Verify the redirect is caught by the app and tokens are securely stored.
5. In the Home Screen, click "Fetch Protected API Data" and ensure a `200 OK` is returned from the Node.js backend.
