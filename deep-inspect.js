#!/usr/bin/env node

/**
 * Deep App Inspector Script
 * This script performs comprehensive UI discovery by navigating through different screens
 * and collecting detailed information about all interactive elements
 */

const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

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

class UIElementDiscovery {
    constructor(driver) {
        this.driver = driver;
        this.discoveredScreens = [];
        this.allElements = {
            clickableElements: [],
            inputElements: [],
            textElements: [],
            buttons: [],
            images: [],
            scrollableElements: []
        };
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async takeScreenshot(name) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            await this.driver.saveScreenshot(`./screenshots/${filename}`);
            console.log(`📸 Screenshot saved: ${filename}`);
            return filename;
        } catch (error) {
            console.log(`❌ Failed to take screenshot: ${error.message}`);
            return null;
        }
    }

    async getCurrentScreenInfo() {
        try {
            const activity = await this.driver.getCurrentActivity();
            const packageName = await this.driver.getCurrentPackage();
            const pageSource = await this.driver.getPageSource();
            const windowSize = await this.driver.getWindowSize();

            return {
                activity,
                package: packageName,
                pageSource,
                windowSize,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.log(`Error getting screen info: ${error.message}`);
            return null;
        }
    }

    async discoverElementsOnCurrentScreen() {
        console.log('🔍 Discovering elements on current screen...');
        
        const screenInfo = await this.getCurrentScreenInfo();
        if (!screenInfo) return null;

        const elements = {
            clickable: [],
            inputs: [],
            texts: [],
            buttons: [],
            scrollable: []
        };

        try {
            // Find all clickable elements
            const clickableElements = await this.driver.$$('//*[@clickable="true"]');
            console.log(`Found ${clickableElements.length} clickable elements`);
            
            for (let i = 0; i < clickableElements.length; i++) {
                try {
                    const element = clickableElements[i];
                    const isDisplayed = await element.isDisplayed();
                    if (isDisplayed) {
                        const text = await element.getText().catch(() => '');
                        const tagName = await element.getTagName().catch(() => '');
                        const bounds = await element.getRect().catch(() => ({}));
                        const contentDesc = await element.getAttribute('content-desc').catch(() => '');
                        const resourceId = await element.getAttribute('resource-id').catch(() => '');
                        
                        elements.clickable.push({
                            index: i,
                            text: text.trim(),
                            tagName,
                            contentDesc,
                            resourceId,
                            bounds,
                            selectors: this.generateSelector(tagName, text, contentDesc, resourceId)
                        });
                    }
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }

            // Find input elements
            const inputElements = await this.driver.$$('//android.widget.EditText');
            console.log(`Found ${inputElements.length} input elements`);
            
            for (let i = 0; i < inputElements.length; i++) {
                try {
                    const element = inputElements[i];
                    const isDisplayed = await element.isDisplayed();
                    if (isDisplayed) {
                        const text = await element.getText().catch(() => '');
                        const hint = await element.getAttribute('hint').catch(() => '');
                        const resourceId = await element.getAttribute('resource-id').catch(() => '');
                        const bounds = await element.getRect().catch(() => ({}));
                        
                        elements.inputs.push({
                            index: i,
                            text: text.trim(),
                            hint,
                            resourceId,
                            bounds,
                            selectors: this.generateInputSelector(hint, resourceId, i)
                        });
                    }
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }

            // Find text elements
            const textElements = await this.driver.$$('//android.widget.TextView');
            console.log(`Found ${textElements.length} text elements`);
            
            for (let i = 0; i < Math.min(textElements.length, 20); i++) {
                try {
                    const element = textElements[i];
                    const isDisplayed = await element.isDisplayed();
                    if (isDisplayed) {
                        const text = await element.getText().catch(() => '');
                        const resourceId = await element.getAttribute('resource-id').catch(() => '');
                        const bounds = await element.getRect().catch(() => ({}));
                        
                        if (text && text.trim() && text.length > 0) {
                            elements.texts.push({
                                index: i,
                                text: text.trim(),
                                resourceId,
                                bounds
                            });
                        }
                    }
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }

            // Find scrollable elements
            const scrollableElements = await this.driver.$$('//*[@scrollable="true"]');
            console.log(`Found ${scrollableElements.length} scrollable elements`);
            
            for (let i = 0; i < scrollableElements.length; i++) {
                try {
                    const element = scrollableElements[i];
                    const isDisplayed = await element.isDisplayed();
                    if (isDisplayed) {
                        const tagName = await element.getTagName().catch(() => '');
                        const resourceId = await element.getAttribute('resource-id').catch(() => '');
                        const bounds = await element.getRect().catch(() => ({}));
                        
                        elements.scrollable.push({
                            index: i,
                            tagName,
                            resourceId,
                            bounds
                        });
                    }
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }

        } catch (error) {
            console.log(`Error discovering elements: ${error.message}`);
        }

        return {
            screenInfo,
            elements,
            screenshot: await this.takeScreenshot(`screen_${screenInfo.activity.split('.').pop()}`)
        };
    }

    generateSelector(tagName, text, contentDesc, resourceId) {
        const selectors = [];
        
        if (resourceId) {
            selectors.push(`android=new UiSelector().resourceId("${resourceId}")`);
            selectors.push(`//*[@resource-id="${resourceId}"]`);
        }
        
        if (text && text.trim()) {
            selectors.push(`android=new UiSelector().text("${text.trim()}")`);
            selectors.push(`//*[@text="${text.trim()}"]`);
        }
        
        if (contentDesc && contentDesc.trim()) {
            selectors.push(`android=new UiSelector().description("${contentDesc.trim()}")`);
            selectors.push(`//*[@content-desc="${contentDesc.trim()}"]`);
        }
        
        return selectors;
    }

    generateInputSelector(hint, resourceId, index) {
        const selectors = [];
        
        if (resourceId) {
            selectors.push(`android=new UiSelector().resourceId("${resourceId}")`);
            selectors.push(`//*[@resource-id="${resourceId}"]`);
        }
        
        if (hint && hint.trim()) {
            selectors.push(`android=new UiSelector().textContains("${hint.trim()}")`);
            selectors.push(`//android.widget.EditText[@hint="${hint.trim()}"]`);
        }
        
        selectors.push(`(//android.widget.EditText)[${index + 1}]`);
        
        return selectors;
    }

    async exploreClickableElements() {
        console.log('\n🎯 Exploring clickable elements...');
        
        const mainScreen = await this.discoverElementsOnCurrentScreen();
        if (!mainScreen) return;
        
        this.discoveredScreens.push(mainScreen);
        
        // Try clicking on major clickable elements to discover new screens
        const clickableElements = mainScreen.elements.clickable;
        
        for (let i = 0; i < Math.min(clickableElements.length, 5); i++) {
            const element = clickableElements[i];
            
            if (element.text || element.contentDesc) {
                console.log(`\n👆 Trying to click: "${element.text || element.contentDesc}"`);
                
                try {
                    // Find and click the element
                    let targetElement = null;
                    
                    // Try to find element using available selectors
                    if (element.selectors && element.selectors.length > 0) {
                        // Try XPath selectors first
                        const xpathSelectors = element.selectors.filter(s => s.startsWith('//'));
                        for (const selector of xpathSelectors) {
                            try {
                                targetElement = await this.driver.$(selector);
                                if (await targetElement.isDisplayed()) {
                                    break;
                                }
                            } catch (e) {
                                // Try next selector
                            }
                        }
                    }

                    // Fallback to basic selectors
                    if (!targetElement) {
                        if (element.resourceId) {
                            targetElement = await this.driver.$(`//*[@resource-id="${element.resourceId}"]`);
                        } else if (element.text) {
                            targetElement = await this.driver.$(`//*[@text="${element.text}"]`);
                        } else if (element.contentDesc) {
                            targetElement = await this.driver.$(`//*[@content-desc="${element.contentDesc}"]`);
                        }
                    }
                    
                    if (targetElement) {
                        try {
                            if (await targetElement.isDisplayed()) {
                                console.log(`   ✅ Found element, clicking...`);
                                await targetElement.click();
                                await this.wait(3000); // Wait for screen to load

                                // Discover elements on new screen
                                const newScreen = await this.discoverElementsOnCurrentScreen();
                                if (newScreen) {
                                    console.log(`   📱 Discovered new screen: ${newScreen.screenInfo.activity}`);
                                    this.discoveredScreens.push(newScreen);
                                }

                                // Go back to main screen
                                console.log(`   ⬅️ Going back to main screen...`);
                                await this.driver.back();
                                await this.wait(2000);
                            } else {
                                console.log(`   ⚠️ Element not displayed, skipping...`);
                            }
                        } catch (clickError) {
                            console.log(`   ❌ Error during click interaction: ${clickError.message}`);
                        }
                    } else {
                        console.log(`   ❌ Could not locate element`);
                    }
                    
                } catch (error) {
                    console.log(`❌ Failed to click element: ${error.message}`);
                }
            }
        }
    }

    generateTestCases() {
        console.log('\n🧪 Generating test cases based on discovered elements...');
        
        const testCases = [];
        
        this.discoveredScreens.forEach((screen, screenIndex) => {
            const screenName = screen.screenInfo.activity.split('.').pop();
            
            // Test case for screen loading
            testCases.push({
                name: `Test ${screenName} Screen Loading`,
                type: 'screen_load',
                description: `Verify that ${screenName} screen loads correctly`,
                steps: [
                    'Launch the app',
                    `Navigate to ${screenName} screen`,
                    'Verify screen elements are displayed'
                ],
                elements: screen.elements.texts.slice(0, 3)
            });
            
            // Test cases for clickable elements
            screen.elements.clickable.forEach((element, index) => {
                if (element.text || element.contentDesc) {
                    testCases.push({
                        name: `Test Click ${element.text || element.contentDesc}`,
                        type: 'click_interaction',
                        description: `Test clicking on ${element.text || element.contentDesc}`,
                        element: element,
                        steps: [
                            'Launch the app',
                            `Locate element: ${element.text || element.contentDesc}`,
                            'Click the element',
                            'Verify expected behavior'
                        ]
                    });
                }
            });
            
            // Test cases for input elements
            screen.elements.inputs.forEach((element, index) => {
                testCases.push({
                    name: `Test Input Field ${element.hint || `Input ${index + 1}`}`,
                    type: 'input_interaction',
                    description: `Test input functionality for ${element.hint || 'input field'}`,
                    element: element,
                    steps: [
                        'Launch the app',
                        `Locate input field: ${element.hint || 'input field'}`,
                        'Enter test data',
                        'Verify input is accepted'
                    ]
                });
            });
        });
        
        return testCases;
    }
}

async function runDeepInspection() {
    console.log('🚀 Starting Deep App Inspection');
    console.log('================================\n');

    // Ensure directories exist
    const dirs = ['screenshots', 'test-results'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    let driver;

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

        // Wait for app to load
        console.log('⏳ Waiting for app to load...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Create discovery instance
        const discovery = new UIElementDiscovery(driver);

        // Perform deep exploration
        await discovery.exploreClickableElements();

        // Generate test cases
        const testCases = discovery.generateTestCases();

        // Save comprehensive results
        const results = {
            timestamp: new Date().toISOString(),
            appInfo: {
                package: await driver.getCurrentPackage().catch(() => 'unknown'),
                activity: await driver.getCurrentActivity().catch(() => 'unknown'),
                windowSize: await driver.getWindowSize().catch(() => ({}))
            },
            discoveredScreens: discovery.discoveredScreens,
            generatedTestCases: testCases,
            summary: {
                totalScreens: discovery.discoveredScreens.length,
                totalClickableElements: discovery.discoveredScreens.reduce((sum, screen) => sum + screen.elements.clickable.length, 0),
                totalInputElements: discovery.discoveredScreens.reduce((sum, screen) => sum + screen.elements.inputs.length, 0),
                totalTextElements: discovery.discoveredScreens.reduce((sum, screen) => sum + screen.elements.texts.length, 0),
                totalTestCases: testCases.length
            }
        };

        fs.writeFileSync(
            './test-results/deep_inspection.json',
            JSON.stringify(results, null, 2)
        );

        // Print summary
        console.log('\n📊 DEEP INSPECTION SUMMARY');
        console.log('==========================');
        console.log(`Screens Discovered: ${results.summary.totalScreens}`);
        console.log(`Clickable Elements: ${results.summary.totalClickableElements}`);
        console.log(`Input Elements: ${results.summary.totalInputElements}`);
        console.log(`Text Elements: ${results.summary.totalTextElements}`);
        console.log(`Generated Test Cases: ${results.summary.totalTestCases}`);

        console.log('\n📁 Generated Files:');
        console.log('- Deep Inspection Results: ./test-results/deep_inspection.json');
        console.log('- Screenshots: ./screenshots/');

        console.log('\n🎯 Next Steps:');
        console.log('1. Review deep_inspection.json for detailed element information');
        console.log('2. Run: node generate-tests.js to create actual test files');
        console.log('3. Customize generated tests based on your app logic');

        return results;

    } catch (error) {
        console.error('❌ Deep inspection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Make sure Appium server is running: appium');
        console.log('- Check if device/emulator is connected: adb devices');
        console.log('- Verify APK path in the script');
    } finally {
        if (driver) {
            console.log('\n🔌 Closing connection...');
            await driver.deleteSession();
        }
    }
}

// Run if called directly
if (require.main === module) {
    runDeepInspection().catch(console.error);
}

module.exports = { UIElementDiscovery, runDeepInspection };
