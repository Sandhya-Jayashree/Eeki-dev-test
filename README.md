# Eeki Dev App - Testing Guide

This guide explains how to use the comprehensive test suite created for the Eeki Dev app based on the discovered UI elements.

## 📋 Overview

The test suite includes multiple specialized test scripts designed to thoroughly test the app's functionality:

### Test Suites Created

1. **Production Data Tests** (`test/specs/production-data.spec.js`)
    - Core functionality tests for all main sections
    - Tests for Specimen, Dome, Harvesting, and Media Moisture sections
    - App launch, navigation, and stability tests

2. **Element Interaction Tests** (`test/specs/element-interactions.spec.js`)
    - Detailed tests for each UI element
    - Element property validation (visibility, clickability, text content)
    - Icon button functionality tests

3. **Data Collection Flow Tests** (`test/specs/data-collection-flow.spec.js`)
    - Business workflow tests
    - Complete data collection session simulation
    - Section-to-section navigation tests

4. **Basic App Tests** (`test/specs/app.basic.test.js`)
    - Fundamental app functionality
    - Device orientation, gestures, and stability

### Page Objects Created

- **ProductionDataPage** (`test/pageobjects/ProductionDataPage.js`)
    - Specialized page object for your app's elements
    - Methods for interacting with Specimen, Dome, Harvesting, Media Moisture sections
    - Element discovery and validation methods

### Test Helpers

- **ProductionTestHelpers** (`test/helpers/ProductionTestHelpers.js`)
    - App-specific testing utilities
    - Performance analysis tools
    - Test data generation for production scenarios

## 🚀 Quick Start

### Environment Setup (Windows)

For Windows users, use the automated environment setup script:

```powershell
# Run the Windows environment setup script
.\setup-env.ps1
```

This script will:
- ✅ Set up Android SDK environment variables (`ANDROID_HOME`, `ANDROID_SDK_ROOT`)
- ✅ Add Android platform-tools to PATH
- ✅ Test ADB connectivity
- ✅ Verify Appium installation and version
- ✅ Check installed Appium drivers
- ✅ Provide next steps and available commands

### Prerequisites

1. **Environment Setup (Windows)**
   ```powershell
   # Automated setup for Windows
   .\setup-env.ps1
   ```

2. **Appium Server Running**
   ```bash
   appium
   ```

3. **Android Device/Emulator Connected**
   ```bash
   adb devices
   ```

4. **APK File Present**
    - Ensure `app-dev-release.apk` is in the project root

### Running Tests

#### Option 1: Quick Test Runner (Recommended)
```bash
# Run all tests
node test-production-app.js all

# Run specific test suite
node test-production-app.js main      # Main production data tests
node test-production-app.js elements  # Element interaction tests
node test-production-app.js flows     # Data collection flow tests
node test-production-app.js basic     # Basic app tests

# Interactive mode
node test-production-app.js interactive
```

#### Option 2: Comprehensive Test Runner
```bash
# Run all test suites with detailed reporting
node run-production-tests.js
```

#### Option 3: Individual Test Suites
```bash
# Run specific test files
npx wdio run wdio.conf.js --spec test/specs/production-data.spec.js
npx wdio run wdio.conf.js --spec test/specs/element-interactions.spec.js
npx wdio run wdio.conf.js --spec test/specs/data-collection-flow.spec.js
```

## 📊 Test Coverage

### Discovered Elements Tested

Based on your app inspection, the tests cover:

#### Main Screen Elements
- ✅ Production Data Collection title
- ✅ Specimen section (🧪, 🔬, "Specimen")
- ✅ Dome section ("Dome" with icon button)
- ✅ Harvesting section (🌾, "Harvesting")
- ✅ Media Moisture section (💧, "Media Moisture")
- ✅ ScrollView container
- ✅ Icon buttons (resource-id: "icon-button")

#### Test Scenarios
- ✅ App launch and stability
- ✅ Section visibility and accessibility
- ✅ Click interactions for each section
- ✅ Icon button functionality (enabled/disabled states)
- ✅ Scrolling within content areas
- ✅ Navigation flow between sections
- ✅ Back button functionality
- ✅ Device orientation changes
- ✅ Performance and responsiveness

## 📁 Generated Files

After running tests, you'll find:

### Screenshots
- `./screenshots/` - Visual verification of test steps
- Timestamped screenshots for each test action
- Before/after screenshots for interactions

### Test Results
- `./test-results/` - JSON files with detailed test data
- `element_discovery.json` - Discovered UI elements
- `production_data_tests.json` - Main test results
- `element_interactions.json` - Element interaction results
- `data_collection_flows.json` - Workflow test results
- `test_execution_report.json` - Overall test execution summary

### Reports
- `./test-results/test_report.html` - HTML test report
- Visual dashboard with test results and metrics

## 🔧 Customization

### Adding New Tests

1. **For New UI Elements:**
   ```javascript
   // Add to ProductionDataPage.js
   get newElement() {
       return $('//android.widget.TextView[@text="New Element"]');
   }
   ```

2. **For New Test Scenarios:**
   ```javascript
   // Add to appropriate spec file
   it('should test new functionality', async () => {
       await ProductionDataPage.newElement.waitForDisplayed();
       await ProductionDataPage.newElement.click();
       // Add assertions
   });
   ```

### Modifying Selectors

If elements are not found, update selectors in `ProductionDataPage.js`:

```javascript
// Example: Update selector if element structure changes
get specimenSection() {
    return $('//*[@content-desc="🧪, 🔬, Specimen"]') ||
           $('//android.widget.TextView[@text="Specimen"]') ||
           $('//*[contains(@text, "Specimen")]');
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Windows Environment Setup Issues**
   ```powershell
   # If setup-env.ps1 fails to run due to execution policy
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\setup-env.ps1

   # If Android SDK not found, install Android Studio or set custom path
   # Edit setup-env.ps1 and update the $AndroidSdkPath variable
   ```

2. **Appium Server Not Running**
   ```bash
   # Start Appium
   appium
   # Or with specific port
   appium -p 4723
   ```

3. **Device Not Connected**
   ```bash
   # Check connected devices
   adb devices
   # Restart ADB if needed
   adb kill-server && adb start-server
   ```

4. **APK Not Found**
    - Ensure `app-dev-release.apk` is in project root
    - Update path in `wdio.conf.js` if different location

5. **Elements Not Found**
    - Run element discovery: `node element-finder.js`
    - Update selectors in page objects
    - Check if app UI has changed

6. **Tests Timing Out**
    - Increase timeout values in test files
    - Check device performance
    - Ensure app is responsive

### Debug Mode

Run tests with debug output:
```bash
# Enable debug logging
DEBUG=true node test-production-app.js main
```

## 📈 Performance Testing

The test suite includes performance analysis:

```javascript
// Performance metrics collected:
- App responsiveness (tap, back button, queries)
- Navigation speed between sections
- Memory usage (if available)
- Overall performance scoring
```

## 🎯 Best Practices

1. **Set Up Environment First (Windows)**
   ```powershell
   # Run environment setup before testing
   .\setup-env.ps1
   ```

2. **Run Element Discovery First**
   ```bash
   node element-finder.js
   ```

3. **Start with Basic Tests**
   ```bash
   node test-production-app.js basic
   ```

4. **Use Interactive Mode for Development**
   ```bash
   node test-production-app.js interactive
   ```

5. **Review Screenshots for Visual Verification**
    - Check `./screenshots/` after each test run

6. **Monitor Test Results**
    - Review JSON files in `./test-results/`

