#!/usr/bin/env node

/**
 * App Inspector Script
 * This script helps you inspect your APK and get element selectors
 * Run this before writing your tests to understand your app structure
 */

const { remote } = require('webdriverio');
const path = require('path');

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

async function inspectApp() {
    console.log('🔍 Starting App Inspection...\n');
    
    let driver;
    
    try {
        // Connect to Appium server
        console.log('📱 Connecting to device...');
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities
        });
        
        console.log('✅ Connected successfully!\n');
        
        // Wait for app to load
        console.log('⏳ Waiting for app to load...');
        await driver.pause(5000);
        
        // Get basic app information
        console.log('📊 App Information:');
        console.log('==================');
        
        try {
            const currentActivity = await driver.getCurrentActivity();
            const currentPackage = await driver.getCurrentPackage();
            const orientation = await driver.getOrientation();
            const windowSize = await driver.getWindowSize();
            
            console.log(`Package: ${currentPackage}`);
            console.log(`Activity: ${currentActivity}`);
            console.log(`Orientation: ${orientation}`);
            console.log(`Screen Size: ${windowSize.width}x${windowSize.height}\n`);
        } catch (error) {
            console.log(`Error getting app info: ${error.message}\n`);
        }
        
        // Get page source for analysis
        console.log('🔍 Analyzing UI Structure...');
        console.log('============================');
        
        const pageSource = await driver.getPageSource();
        
        // Extract useful information from page source
        const textElements = extractTextElements(pageSource);
        const buttonElements = extractButtonElements(pageSource);
        const inputElements = extractInputElements(pageSource);
        const imageElements = extractImageElements(pageSource);
        
        console.log(`📝 Text Elements Found: ${textElements.length}`);
        if (textElements.length > 0) {
            console.log('   Sample texts:');
            textElements.slice(0, 5).forEach((text, index) => {
                console.log(`   ${index + 1}. "${text}"`);
            });
            if (textElements.length > 5) {
                console.log(`   ... and ${textElements.length - 5} more`);
            }
        }
        console.log('');
        
        console.log(`🔘 Button Elements Found: ${buttonElements.length}`);
        if (buttonElements.length > 0) {
            console.log('   Sample buttons:');
            buttonElements.slice(0, 5).forEach((button, index) => {
                console.log(`   ${index + 1}. "${button}"`);
            });
            if (buttonElements.length > 5) {
                console.log(`   ... and ${buttonElements.length - 5} more`);
            }
        }
        console.log('');
        
        console.log(`📝 Input Elements Found: ${inputElements.length}`);
        if (inputElements.length > 0) {
            console.log('   Input fields detected');
        }
        console.log('');
        
        console.log(`🖼️  Image Elements Found: ${imageElements.length}`);
        console.log('');
        
        // Generate suggested selectors
        console.log('💡 Suggested Selectors for Testing:');
        console.log('===================================');
        
        if (textElements.length > 0) {
            console.log('Text Elements:');
            textElements.slice(0, 3).forEach(text => {
                console.log(`   XPath: //android.widget.TextView[@text="${text}"]`);
                console.log(`   UiSelector: android=new UiSelector().text("${text}")`);
                console.log('');
            });
        }
        
        if (buttonElements.length > 0) {
            console.log('Button Elements:');
            buttonElements.slice(0, 3).forEach(button => {
                console.log(`   XPath: //android.widget.Button[@text="${button}"]`);
                console.log(`   UiSelector: android=new UiSelector().textContains("${button}")`);
                console.log('');
            });
        }
        
        // Take screenshot for reference
        console.log('📸 Taking screenshot for reference...');
        await driver.saveScreenshot('./screenshots/app_inspection.png');
        console.log('✅ Screenshot saved: ./screenshots/app_inspection.png\n');
        
        // Save detailed analysis
        const analysis = {
            timestamp: new Date().toISOString(),
            appInfo: {
                package: await driver.getCurrentPackage().catch(() => 'unknown'),
                activity: await driver.getCurrentActivity().catch(() => 'unknown'),
                orientation: await driver.getOrientation().catch(() => 'unknown'),
                windowSize: await driver.getWindowSize().catch(() => ({}))
            },
            elements: {
                textElements,
                buttonElements,
                inputElements: inputElements.length,
                imageElements: imageElements.length
            },
            pageSource: pageSource
        };
        
        const fs = require('fs');
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }
        
        fs.writeFileSync(
            './test-results/app_inspection.json',
            JSON.stringify(analysis, null, 2)
        );
        
        console.log('💾 Detailed analysis saved: ./test-results/app_inspection.json\n');
        
        // Provide next steps
        console.log('🎯 Next Steps:');
        console.log('=============');
        console.log('1. Review the screenshot to understand your app layout');
        console.log('2. Check the JSON file for detailed element information');
        console.log('3. Update test/pageobjects/AppPage.js with actual selectors');
        console.log('4. Customize test scenarios based on your app functionality');
        console.log('5. Run the test suite: npm test\n');
        
    } catch (error) {
        console.error('❌ Error during inspection:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Make sure Appium server is running: appium');
        console.log('- Check if device/emulator is connected: adb devices');
        console.log('- Verify APK path in the script');
        console.log('- Ensure device has enough free space');
    } finally {
        if (driver) {
            console.log('🔌 Closing connection...');
            await driver.deleteSession();
        }
    }
}

function extractTextElements(pageSource) {
    const textRegex = /<android\.widget\.TextView[^>]*text="([^"]+)"/g;
    const texts = [];
    let match;
    
    while ((match = textRegex.exec(pageSource)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 0 && !texts.includes(text)) {
            texts.push(text);
        }
    }
    
    return texts;
}

function extractButtonElements(pageSource) {
    const buttonRegex = /<android\.widget\.Button[^>]*text="([^"]+)"/g;
    const buttons = [];
    let match;
    
    while ((match = buttonRegex.exec(pageSource)) !== null) {
        const button = match[1].trim();
        if (button && button.length > 0 && !buttons.includes(button)) {
            buttons.push(button);
        }
    }
    
    return buttons;
}

function extractInputElements(pageSource) {
    const inputRegex = /<android\.widget\.EditText[^>]*(?:text="([^"]*)")?[^>]*(?:hint="([^"]*)")?[^>]*(?:resource-id="([^"]*)")?[^>]*>/g;
    const inputs = [];
    let match;

    while ((match = inputRegex.exec(pageSource)) !== null) {
        const inputInfo = {
            text: match[1] || '',
            hint: match[2] || '',
            resourceId: match[3] || '',
            fullElement: match[0]
        };
        inputs.push(inputInfo);
    }

    return inputs;
}

function extractImageElements(pageSource) {
    const imageRegex = /<android\.widget\.ImageView/g;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(pageSource)) !== null) {
        images.push(match[0]);
    }
    
    return images;
}

// Run the inspection
if (require.main === module) {
    inspectApp().catch(console.error);
}

module.exports = { inspectApp };
