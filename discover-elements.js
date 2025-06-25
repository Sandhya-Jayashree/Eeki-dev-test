/**
 * Element Discovery Script
 * This script will connect to your app and discover all available elements
 * so we can update the selectors in ProductionDataPage.js
 */

const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

async function discoverElements() {
    console.log('🔍 Starting element discovery...');
    
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
        console.log('📱 Connecting to app...');
        driver = await remote(wdOpts);
        
        // Wait for app to load
        await driver.pause(5000);
        
        console.log('📸 Taking screenshot...');
        await driver.saveScreenshot('./screenshots/element_discovery.png');
        
        console.log('🔍 Discovering all elements...');
        
        // Get page source for analysis
        const pageSource = await driver.getPageSource();
        fs.writeFileSync('./element_discovery_source.xml', pageSource);
        console.log('💾 Page source saved to element_discovery_source.xml');
        
        // Find all clickable elements
        console.log('\n=== CLICKABLE ELEMENTS ===');
        const clickableElements = await driver.$$('//*[@clickable="true"]');
        console.log(`Found ${clickableElements.length} clickable elements:`);
        
        for (let i = 0; i < Math.min(clickableElements.length, 20); i++) {
            try {
                const element = clickableElements[i];
                const tagName = await element.getTagName();
                const text = await element.getText().catch(() => '');
                const contentDesc = await element.getAttribute('content-desc').catch(() => '');
                const resourceId = await element.getAttribute('resource-id').catch(() => '');
                const className = await element.getAttribute('class').catch(() => '');
                
                console.log(`${i + 1}. ${tagName}`);
                if (text) console.log(`   Text: "${text}"`);
                if (contentDesc) console.log(`   Content-desc: "${contentDesc}"`);
                if (resourceId) console.log(`   Resource-id: "${resourceId}"`);
                if (className) console.log(`   Class: "${className}"`);
                console.log('');
            } catch (error) {
                console.log(`${i + 1}. Error getting element info: ${error.message}`);
            }
        }
        
        // Find all text elements
        console.log('\n=== TEXT ELEMENTS ===');
        const textElements = await driver.$$('//android.widget.TextView');
        console.log(`Found ${textElements.length} text elements:`);
        
        for (let i = 0; i < Math.min(textElements.length, 15); i++) {
            try {
                const element = textElements[i];
                const text = await element.getText();
                const contentDesc = await element.getAttribute('content-desc').catch(() => '');
                const resourceId = await element.getAttribute('resource-id').catch(() => '');
                
                if (text && text.trim()) {
                    console.log(`${i + 1}. Text: "${text}"`);
                    if (contentDesc) console.log(`   Content-desc: "${contentDesc}"`);
                    if (resourceId) console.log(`   Resource-id: "${resourceId}"`);
                    console.log(`   XPath: //android.widget.TextView[@text="${text}"]`);
                    console.log('');
                }
            } catch (error) {
                console.log(`${i + 1}. Error getting text element: ${error.message}`);
            }
        }
        
        // Find all buttons
        console.log('\n=== BUTTON ELEMENTS ===');
        const buttonElements = await driver.$$('//android.widget.Button');
        console.log(`Found ${buttonElements.length} button elements:`);
        
        for (let i = 0; i < buttonElements.length; i++) {
            try {
                const element = buttonElements[i];
                const text = await element.getText().catch(() => '');
                const contentDesc = await element.getAttribute('content-desc').catch(() => '');
                const resourceId = await element.getAttribute('resource-id').catch(() => '');
                
                console.log(`${i + 1}. Button`);
                if (text) console.log(`   Text: "${text}"`);
                if (contentDesc) console.log(`   Content-desc: "${contentDesc}"`);
                if (resourceId) console.log(`   Resource-id: "${resourceId}"`);
                console.log('');
            } catch (error) {
                console.log(`${i + 1}. Error getting button element: ${error.message}`);
            }
        }
        
        // Look for specific keywords
        console.log('\n=== SEARCHING FOR SPECIFIC KEYWORDS ===');
        const keywords = ['Specimen', 'Dome', 'Harvesting', 'Media', 'Moisture', 'Production', 'Data', 'Collection'];
        
        for (const keyword of keywords) {
            try {
                console.log(`\nSearching for "${keyword}":`);
                
                // Search by text
                const byText = await driver.$$(`//*[contains(@text, "${keyword}")]`);
                if (byText.length > 0) {
                    console.log(`  Found ${byText.length} elements with text containing "${keyword}"`);
                    for (let i = 0; i < Math.min(byText.length, 3); i++) {
                        const text = await byText[i].getText().catch(() => '');
                        const tagName = await byText[i].getTagName().catch(() => '');
                        console.log(`    ${tagName}: "${text}"`);
                    }
                }
                
                // Search by content-desc
                const byContentDesc = await driver.$$(`//*[contains(@content-desc, "${keyword}")]`);
                if (byContentDesc.length > 0) {
                    console.log(`  Found ${byContentDesc.length} elements with content-desc containing "${keyword}"`);
                    for (let i = 0; i < Math.min(byContentDesc.length, 3); i++) {
                        const contentDesc = await byContentDesc[i].getAttribute('content-desc').catch(() => '');
                        const tagName = await byContentDesc[i].getTagName().catch(() => '');
                        console.log(`    ${tagName}: content-desc="${contentDesc}"`);
                    }
                }
            } catch (error) {
                console.log(`  Error searching for "${keyword}": ${error.message}`);
            }
        }
        
        console.log('\n✅ Element discovery completed!');
        console.log('📁 Check the following files:');
        console.log('  - element_discovery_source.xml (full page source)');
        console.log('  - screenshots/element_discovery.png (screenshot)');
        
    } catch (error) {
        console.error('❌ Discovery failed:', error.message);
    } finally {
        if (driver) {
            console.log('🔚 Closing session...');
            await driver.deleteSession();
        }
    }
}

// Run the discovery
discoverElements().catch(console.error);
