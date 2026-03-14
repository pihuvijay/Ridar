# Google Maps Setup Guide

This guide will help you set up Google Maps for the react-native-maps implementation in your React Native Android app.

## Prerequisites

- Google Cloud Project
- Google Maps API enabled
- Google Play Services library

## Steps to Set Up Google Maps API Key

### 1. Create a Google Cloud Project (if you don't have one)

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Note the project ID

### 2. Get Your Android App's SHA-1 Certificate Fingerprint

For Android, you'll need to get your app's debugging SHA-1 fingerprint:

```bash
cd frontend/android
./gradlew signingReport
```

Look for the "SHA-1" value in the output. You'll need this for the API key configuration.

For the debug keystore location on Windows, it's typically at:
```
C:\Users\<YourUsername>\.android\debug.keystore
```

Or run this command to get the SHA-1:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 3. Enable the Maps SDK for Android

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. In the search bar, search for "Maps SDK for Android"
3. Click on "Maps SDK for Android" and enable it
4. Also enable "Google Play services" if not already enabled

### 4. Create an API Key

1. Go to **APIs & Services** > **Credentials** in the Google Cloud Console
2. Click **Create Credentials** > **API Key**
3. For Android apps, you can restrict the API key to Android apps:
   - Click on the new API key to edit it
   - Under "Application restrictions", select **Android apps**
   - Click **Add package name and fingerprint**
   - Add your package name: `com.leno4.frontend`
   - Add the SHA-1 fingerprint you got from step 2

### 5. Add the API Key to Your Android Manifest

The API key has already been added to the manifest. Open:
```
frontend/android/app/src/main/AndroidManifest.xml
```

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY_HERE"/>
```

### 6. Verify Dependencies

The following dependencies have been added to `frontend/android/app/build.gradle`:

```gradle
implementation("com.google.android.gms:play-services-maps:18.2.0")
```

This enables Google Play Services Maps for your app.

## Environment Variables (Optional)

For better security, you can use Expo's `.env` file to manage your API key:

1. Create a `.env` file in your `frontend` directory:
```
GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
```

2. Then update the manifest to use a dynamic approach (requires build customization)

## Testing

After setting up the API key:

1. Build and run the app:
```bash
cd frontend
npm run android
```

2. The map should now display with:
   - Interactive Google Maps centered on San Francisco Bay Area (default location)
   - Blue markers showing sample ride group locations
   - Full zoom, pan, and rotation controls
   - User location display (with proper permissions)

## Permissions

The following permissions have been added to `AndroidManifest.xml`:

- `android.permission.ACCESS_FINE_LOCATION` - For precise GPS location
- `android.permission.ACCESS_COARSE_LOCATION` - For approximate location

The app will request these permissions at runtime on Android 6.0+.

## Features Implemented

Your MapScreen now includes:

- 🗺️ **Interactive Google Maps** - Full pan, zoom, and rotation support
- 📍 **Ride Group Markers** - Sample markers displayed on the map
- 📌 **User Location** - Shows user's current location if permitted
- 🔍 **My Location Button** - Quick access to center on user's location
- 🎨 **Custom Styling** - Blue markers (`#155dfc`) matching your app's design

## Next Steps

1. Replace the sample `rideGroups` array with real data from your backend API
2. Implement proper location tracking if needed
3. Add marker tap handlers to show ride group details
4. Consider adding custom marker icons for better UX

## Troubleshooting

### Map shows blank/gray screen
- Check that your API key is correctly set in `AndroidManifest.xml`
- Ensure the API key is enabled for Maps SDK for Android
- Verify your package name and SHA-1 fingerprint match the API key configuration

### Location not showing
- Check permissions in Android settings for your app
- Ensure `ACCESS_FINE_LOCATION` or `ACCESS_COARSE_LOCATION` permissions are granted

### Build errors
- Run `./gradlew clean` in the `frontend/android` directory
- Delete `node_modules` and run `npm install` again
- Ensure you're using the correct Android SDK versions

## Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/android-sdk)
- [Google Cloud Console](https://console.cloud.google.com/)
