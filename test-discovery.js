#!/usr/bin/env node

/**
 * Test Discovery Scripts
 * Quick test to verify all discovery scripts work correctly
 */

const fs = require('fs');

async function testScripts() {
    console.log('🧪 Testing Discovery Scripts');
    console.log('============================\n');

    // Test 1: Check if all required files exist
    console.log('📋 Test 1: Checking required files...');
    const requiredFiles = [
        'inspect-app.js',
        'element-finder.js', 
        'deep-inspect.js',
        'generate-tests.js',
        'discover-and-test.js',
        'start-discovery.js'
    ];

    let allFilesExist = true;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    });

    if (!allFilesExist) {
        console.log('\n❌ Some required files are missing. Please ensure all scripts are present.');
        return false;
    }

    // Test 2: Check APK file
    console.log('\n📋 Test 2: Checking APK file...');
    if (fs.existsSync('app-dev-release.apk')) {
        console.log('   ✅ APK file found');
    } else {
        console.log('   ⚠️  APK file not found (app-dev-release.apk)');
        console.log('   Place your APK file in the project root with this name');
    }

    // Test 3: Check directories
    console.log('\n📋 Test 3: Checking/creating directories...');
    const requiredDirs = [
        'screenshots',
        'test-results', 
        'test/specs',
        'test/pageobjects',
        'test/helpers'
    ];

    requiredDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`   📁 Created: ${dir}`);
        } else {
            console.log(`   ✅ ${dir}`);
        }
    });

    // Test 4: Check Node modules
    console.log('\n📋 Test 4: Checking dependencies...');
    const requiredModules = [
        'webdriverio',
        'appium'
    ];

    let allModulesExist = true;
    requiredModules.forEach(module => {
        try {
            require.resolve(module);
            console.log(`   ✅ ${module}`);
        } catch (error) {
            console.log(`   ❌ ${module} - NOT INSTALLED`);
            allModulesExist = false;
        }
    });

    if (!allModulesExist) {
        console.log('\n⚠️  Some dependencies are missing. Run: npm install');
    }

    // Test 5: Syntax check (basic)
    console.log('\n📋 Test 5: Basic syntax check...');
    const scriptsToCheck = [
        'element-finder.js',
        'deep-inspect.js', 
        'generate-tests.js'
    ];

    let allSyntaxOk = true;
    for (const script of scriptsToCheck) {
        try {
            require(`./${script}`);
            console.log(`   ✅ ${script} - Syntax OK`);
        } catch (error) {
            console.log(`   ❌ ${script} - Syntax Error: ${error.message}`);
            allSyntaxOk = false;
        }
    }

    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    
    if (allFilesExist && allSyntaxOk) {
        console.log('✅ All tests passed! Scripts are ready to use.');
        console.log('\n🚀 Next steps:');
        console.log('1. Start Appium server: appium');
        console.log('2. Connect Android device/emulator');
        console.log('3. Run discovery: node start-discovery.js');
        return true;
    } else {
        console.log('❌ Some tests failed. Please fix the issues above.');
        return false;
    }
}

// Show usage instructions
function showUsage() {
    console.log('\n📖 USAGE GUIDE');
    console.log('==============');
    console.log('');
    console.log('🔍 Discovery Options:');
    console.log('');
    console.log('1. Interactive Helper:');
    console.log('   node start-discovery.js');
    console.log('   (Recommended - guides you through the process)');
    console.log('');
    console.log('2. Quick Element Discovery:');
    console.log('   node element-finder.js');
    console.log('   (Fast - finds buttons, inputs, text elements)');
    console.log('');
    console.log('3. Deep App Exploration:');
    console.log('   node deep-inspect.js');
    console.log('   (Comprehensive - navigates through app screens)');
    console.log('');
    console.log('4. Complete Workflow:');
    console.log('   node discover-and-test.js');
    console.log('   (Full automation - discovery + test generation)');
    console.log('');
    console.log('🧪 Test Generation:');
    console.log('   node generate-tests.js');
    console.log('   (Generates test files from discovery results)');
    console.log('');
    console.log('🏃 Running Tests:');
    console.log('   npm test');
    console.log('   (Runs generated test suite)');
    console.log('');
    console.log('📊 View Results:');
    console.log('   ls test-results/        # Discovery results');
    console.log('   ls screenshots/         # App screenshots');
    console.log('   ls test/specs/          # Generated tests');
    console.log('');
}

// Show troubleshooting tips
function showTroubleshooting() {
    console.log('\n🔧 TROUBLESHOOTING');
    console.log('==================');
    console.log('');
    console.log('❌ "Connection failed" errors:');
    console.log('   - Start Appium server: appium');
    console.log('   - Check device connection: adb devices');
    console.log('   - Ensure device has enough free space');
    console.log('');
    console.log('❌ "No elements found" errors:');
    console.log('   - Wait for app to load completely');
    console.log('   - Check if APK is compatible with device');
    console.log('   - Try increasing wait times in scripts');
    console.log('');
    console.log('❌ "Tests fail" errors:');
    console.log('   - Review generated selectors in page objects');
    console.log('   - Check if app UI changed');
    console.log('   - Update selectors based on current app state');
    console.log('');
    console.log('❌ "App crashes" during discovery:');
    console.log('   - Check device logs: adb logcat');
    console.log('   - Reduce discovery speed (increase wait times)');
    console.log('   - Test with different device/emulator');
    console.log('');
    console.log('📞 Getting Help:');
    console.log('   - Review discovery results in test-results/');
    console.log('   - Check screenshots in screenshots/');
    console.log('   - Read detailed report: test-results/DISCOVERY_REPORT.md');
    console.log('');
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    if (args.includes('--troubleshoot') || args.includes('-t')) {
        showTroubleshooting();
        return;
    }
    
    const success = await testScripts();
    
    if (success) {
        showUsage();
    } else {
        showTroubleshooting();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testScripts };
