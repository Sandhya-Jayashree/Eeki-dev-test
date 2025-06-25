# Production Data Collection App - Single Comprehensive Test

This project contains a single comprehensive test for the Production Data Collection mobile app.

## Test Overview

The test performs the following actions:
1. **Open the app** - Launches and verifies the main screen
2. **Click Specimen button** → Screen changes → Press back
3. **Click Dome button** → Expands to show Harvesting and Media Moisture items (no screen change)
4. **Click Harvesting button** → Screen changes → Press back
5. **Click Media Moisture button** → Screen changes → Press back

## Project Structure

```
├── test/
│   ├── pageobjects/
│   │   └── ProductionDataPage.js    # Page object with element selectors
│   └── specs/
│       └── single-comprehensive-test.js    # Single test file
├── app-dev-release.apk              # APK file to test
├── wdio.conf.js                     # WebDriverIO configuration
└── package.json                     # Dependencies and scripts
```

## Prerequisites

1. **Node.js** (v14 or higher)
2. **Android SDK** with ADB
3. **Appium Server** (v2.x)
4. **Android Emulator** or physical Android device

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start Appium server:
```bash
npm run appium:start
```

3. Ensure Android emulator is running or device is connected

## Running the Test

Run the single comprehensive test:
```bash
npm test
```

This will execute the test file `test/specs/single-comprehensive-test.js` which contains all the required test scenarios.

## Test Results

- Screenshots are saved in the `screenshots/` directory
- Test results are logged to the console
- Each button interaction is documented with before/after screenshots

## Configuration

The test is configured in `wdio.conf.js` to:
- Use Android platform
- Target the `app-dev-release.apk` file
- Run on Android Emulator (or modify for real device)
- Use UiAutomator2 automation engine



