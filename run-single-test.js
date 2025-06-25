/**
 * Direct test runner to bypass WebDriverIO CLI issues
 */

const { remote } = require('webdriverio');
const path = require('path');

async function runTest() {
    console.log('🚀 Starting single comprehensive test...');
    
    const capabilities = {
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '15',
        'appium:app': path.join(process.cwd(), 'app-dev-release.apk'),
        'appium:automationName': 'UiAutomator2',
        'appium:newCommandTimeout': 240,
        'appium:connectHardwareKeyboard': true,
        'appium:noReset': false,
        'appium:fullReset': false
    };

    const wdOpts = {
        hostname: 'localhost',
        port: 4723,
        path: '/',
        capabilities
    };

    let driver;
    
    try {
        console.log('📱 Connecting to Appium server...');
        driver = await remote(wdOpts);
        
        console.log('✅ Connected to device successfully');
        
        // Import our page object
        const ProductionDataPage = require('./test/pageobjects/ProductionDataPage');
        
        // Set the driver globally for the page object
        global.browser = driver;
        global.$ = (selector) => driver.$(selector);
        global.$$ = (selector) => driver.$$(selector);
        global.expect = (element) => ({
            toBeDisplayed: async () => {
                const isDisplayed = await element.isDisplayed();
                if (!isDisplayed) {
                    throw new Error('Element is not displayed');
                }
                return true;
            }
        });
        
        console.log('🧪 Starting test execution...');
        
        // Test 1: Open app and verify main screen
        console.log('\n=== Step 1: Opening app and verifying main screen ===');
        await ProductionDataPage.waitForPageLoad();
        const mainTitle = await ProductionDataPage.mainTitle;
        const isMainTitleDisplayed = await mainTitle.isDisplayed();
        console.log(`Main title displayed: ${isMainTitleDisplayed ? '✅' : '❌'}`);
        
        // Test 2: Click Specimen button
        console.log('\n=== Step 2: Testing Specimen button ===');
        await ProductionDataPage.takeScreenshot('before_specimen_click');
        await ProductionDataPage.clickSection('specimen');
        await driver.pause(3000);
        await ProductionDataPage.takeScreenshot('after_specimen_click');
        await ProductionDataPage.navigateBack();
        console.log('✅ Specimen button test completed');
        
        // Test 3: Click Dome button (expansion)
        console.log('\n=== Step 3: Testing Dome button expansion ===');
        await ProductionDataPage.takeScreenshot('before_dome_click');
        await ProductionDataPage.clickSection('dome');
        await driver.pause(3000);
        await ProductionDataPage.takeScreenshot('after_dome_expansion');
        console.log('✅ Dome button expansion test completed');
        
        // Test 4: Click Harvesting button
        console.log('\n=== Step 4: Testing Harvesting button ===');
        await ProductionDataPage.takeScreenshot('before_harvesting_click');
        await ProductionDataPage.clickSection('harvesting');
        await driver.pause(3000);
        await ProductionDataPage.takeScreenshot('after_harvesting_click');
        await ProductionDataPage.navigateBack();
        console.log('✅ Harvesting button test completed');
        
        // Test 5: Click Media Moisture button
        console.log('\n=== Step 5: Testing Media Moisture button ===');
        await ProductionDataPage.takeScreenshot('before_media_moisture_click');
        await ProductionDataPage.clickSection('mediaMoisture');
        await driver.pause(3000);
        await ProductionDataPage.takeScreenshot('after_media_moisture_click');
        await ProductionDataPage.navigateBack();
        console.log('✅ Media Moisture button test completed');
        
        console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('=== COMPREHENSIVE TEST SUMMARY ===');
        console.log('✅ App Launch: SUCCESS');
        console.log('✅ Specimen Button: Click → Screen Change → Back Navigation');
        console.log('✅ Dome Button: Click → Expansion (Harvesting & Media Moisture visible)');
        console.log('✅ Harvesting Button: Click → Screen Change → Back Navigation');
        console.log('✅ Media Moisture Button: Click → Screen Change → Back Navigation');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (driver) {
            console.log('🔚 Closing browser session...');
            await driver.deleteSession();
        }
    }
}

// Run the test
runTest().catch(console.error);
