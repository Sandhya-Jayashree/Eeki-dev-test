#!/usr/bin/env node

/**
 * Simple Test Runner
 * Runs basic tests without WebDriverIO configuration issues
 */

const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

// Test configuration
const capabilities = {
    platformName: 'Android',
    'appium:deviceName': 'Android Emulator',
    'appium:platformVersion': '15',
    'appium:app': path.join(process.cwd(), 'app-dev-release.apk'),
    'appium:automationName': 'UiAutomator2',
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:fullReset': false
};

// Ensure directories exist
function ensureDirectories() {
    const dirs = ['screenshots', 'test-results'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Take screenshot
async function takeScreenshot(driver, name) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}_${timestamp}.png`;
        await driver.saveScreenshot(`./screenshots/${filename}`);
        console.log(`📸 Screenshot saved: ${filename}`);
        return filename;
    } catch (error) {
        console.log(`❌ Failed to take screenshot: ${error.message}`);
        return null;
    }
}

// Wait helper
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test: App Launch
async function testAppLaunch(driver) {
    console.log('\n🧪 TEST: App Launch');
    console.log('==================');
    
    try {
        // Wait for app to load
        console.log('⏳ Waiting for app to load...');
        await wait(5000);
        
        // Get app information
        const currentActivity = await driver.getCurrentActivity();
        const currentPackage = await driver.getCurrentPackage();
        
        console.log(`✅ App launched successfully!`);
        console.log(`   Package: ${currentPackage}`);
        console.log(`   Activity: ${currentActivity}`);
        
        await takeScreenshot(driver, 'app_launch_test');
        
        return {
            passed: true,
            package: currentPackage,
            activity: currentActivity
        };
        
    } catch (error) {
        console.log(`❌ App launch failed: ${error.message}`);
        await takeScreenshot(driver, 'app_launch_failed');
        return { passed: false, error: error.message };
    }
}

// Test: UI Elements Detection
async function testUIElements(driver) {
    console.log('\n🧪 TEST: UI Elements Detection');
    console.log('==============================');
    
    try {
        // Get all text elements
        const textElements = await driver.$$('//android.widget.TextView');
        console.log(`📝 Found ${textElements.length} text elements`);
        
        // Get visible text
        const visibleTexts = [];
        for (let i = 0; i < Math.min(textElements.length, 10); i++) {
            try {
                if (await textElements[i].isDisplayed()) {
                    const text = await textElements[i].getText();
                    if (text && text.trim()) {
                        visibleTexts.push(text.trim());
                    }
                }
            } catch (error) {
                // Skip elements that can't be accessed
            }
        }
        
        console.log(`✅ Visible text elements: ${visibleTexts.length}`);
        visibleTexts.slice(0, 5).forEach((text, index) => {
            console.log(`   ${index + 1}. "${text}"`);
        });
        
        await takeScreenshot(driver, 'ui_elements_test');
        
        return {
            passed: true,
            totalElements: textElements.length,
            visibleTexts: visibleTexts
        };
        
    } catch (error) {
        console.log(`❌ UI elements detection failed: ${error.message}`);
        await takeScreenshot(driver, 'ui_elements_failed');
        return { passed: false, error: error.message };
    }
}

// Test: Basic Interactions
async function testBasicInteractions(driver) {
    console.log('\n🧪 TEST: Basic Interactions');
    console.log('===========================');
    
    try {
        const { width, height } = await driver.getWindowSize();
        console.log(`📱 Screen size: ${width}x${height}`);
        
        // Test swipe down
        console.log('👆 Testing swipe down...');
        await driver.touchAction([
            { action: 'press', x: width / 2, y: height / 2 },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: width / 2, y: height * 0.7 },
            { action: 'release' }
        ]);
        await wait(1000);
        
        // Test swipe up
        console.log('👆 Testing swipe up...');
        await driver.touchAction([
            { action: 'press', x: width / 2, y: height * 0.7 },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: width / 2, y: height / 2 },
            { action: 'release' }
        ]);
        await wait(1000);
        
        // Test tap
        console.log('👆 Testing tap...');
        await driver.touchAction({
            action: 'tap',
            x: width / 2,
            y: height / 3
        });
        await wait(1000);
        
        console.log('✅ Basic interactions completed successfully!');
        await takeScreenshot(driver, 'basic_interactions_test');
        
        return { passed: true };
        
    } catch (error) {
        console.log(`❌ Basic interactions failed: ${error.message}`);
        await takeScreenshot(driver, 'basic_interactions_failed');
        return { passed: false, error: error.message };
    }
}

// Test: App Navigation
async function testAppNavigation(driver) {
    console.log('\n🧪 TEST: App Navigation');
    console.log('=======================');
    
    try {
        // Look for clickable elements
        const clickableElements = await driver.$$('//*[@clickable="true"]');
        console.log(`🔘 Found ${clickableElements.length} clickable elements`);
        
        if (clickableElements.length > 0) {
            // Try to click the first clickable element
            try {
                if (await clickableElements[0].isDisplayed()) {
                    console.log('👆 Clicking first clickable element...');
                    await clickableElements[0].click();
                    await wait(2000);
                    
                    // Take screenshot after click
                    await takeScreenshot(driver, 'after_click');
                    
                    // Go back
                    console.log('⬅️ Going back...');
                    await driver.back();
                    await wait(1000);
                }
            } catch (clickError) {
                console.log(`⚠️ Could not click element: ${clickError.message}`);
            }
        }
        
        console.log('✅ App navigation test completed!');
        await takeScreenshot(driver, 'app_navigation_test');
        
        return { 
            passed: true, 
            clickableElements: clickableElements.length 
        };
        
    } catch (error) {
        console.log(`❌ App navigation failed: ${error.message}`);
        await takeScreenshot(driver, 'app_navigation_failed');
        return { passed: false, error: error.message };
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting APK Automation Tests');
    console.log('=================================\n');
    
    ensureDirectories();
    
    let driver;
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
        // Connect to Appium
        console.log('📱 Connecting to Appium server...');
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities
        });
        
        console.log('✅ Connected to device successfully!\n');
        
        // Run tests
        const tests = [
            { name: 'App Launch', func: testAppLaunch },
            { name: 'UI Elements Detection', func: testUIElements },
            { name: 'Basic Interactions', func: testBasicInteractions },
            { name: 'App Navigation', func: testAppNavigation }
        ];
        
        for (const test of tests) {
            const result = await test.func(driver);
            testResults.tests.push({
                name: test.name,
                ...result
            });
            
            if (result.passed) {
                testResults.summary.passed++;
                console.log(`✅ ${test.name}: PASSED`);
            } else {
                testResults.summary.failed++;
                console.log(`❌ ${test.name}: FAILED`);
            }
            
            testResults.summary.total++;
            
            // Wait between tests
            await wait(2000);
        }
        
    } catch (error) {
        console.error(`❌ Test execution failed: ${error.message}`);
        testResults.error = error.message;
    } finally {
        if (driver) {
            console.log('\n🔌 Closing connection...');
            await driver.deleteSession();
        }
    }
    
    // Save results
    fs.writeFileSync(
        './test-results/test_results.json',
        JSON.stringify(testResults, null, 2)
    );
    
    // Print summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n📁 Generated Files:');
    console.log('- Screenshots: ./screenshots/');
    console.log('- Test Results: ./test-results/test_results.json');
    
    console.log('\n🎉 Test execution completed!');
    
    return testResults.summary.failed === 0;
}

// Run if called directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runTests };
