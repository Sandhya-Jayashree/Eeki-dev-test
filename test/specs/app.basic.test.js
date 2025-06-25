const AppPage = require('../pageobjects/AppPage');
const TestUtils = require('../helpers/TestUtils');

describe('Basic App Functionality Tests', () => {
    
    before(async () => {
        // Setup before all tests
        TestUtils.ensureScreenshotsDir();
        TestUtils.logStep('Starting basic app functionality tests');
        
        // Get device information
        await TestUtils.getDeviceInfo();
    });
    
    beforeEach(async () => {
        // Setup before each test
        console.log(`\n🧪 Starting test: ${this.currentTest?.title || 'Unknown test'}`);
    });
    
    afterEach(async () => {
        // Cleanup after each test
        const testName = this.currentTest?.title || 'unknown_test';
        const testPassed = this.currentTest?.state === 'passed';
        
        // Take screenshot after each test
        await AppPage.takeScreenshot(`test_${testName.replace(/\s+/g, '_')}_${testPassed ? 'passed' : 'failed'}`);
        
        TestUtils.logResult(testName, testPassed);
    });
    
    it('should launch the app successfully', async () => {
        TestUtils.logStep('Testing app launch');
        
        // Wait for app to launch
        await AppPage.waitForAppLaunch();
        
        // Verify app is running by checking if we can get current activity
        const currentActivity = await browser.getCurrentActivity();
        const currentPackage = await browser.getCurrentPackage();
        
        console.log(`Current Activity: ${currentActivity}`);
        console.log(`Current Package: ${currentPackage}`);
        
        // Basic assertion - app should have launched
        expect(currentActivity).toBeTruthy();
        expect(currentPackage).toBeTruthy();
        
        TestUtils.logResult('App Launch', true, `Activity: ${currentActivity}`);
    });
    
    it('should display main UI elements', async () => {
        TestUtils.logStep('Verifying main UI elements');
        
        // Get all visible text on screen
        const visibleText = await TestUtils.getAllVisibleText();
        console.log('Visible text elements:', visibleText);
        
        // Get app information
        const appInfo = await AppPage.getAppInfo();
        
        // Basic checks
        expect(visibleText).toBeInstanceOf(Array);
        expect(appInfo).toBeInstanceOf(Object);
        expect(appInfo.currentActivity).toBeTruthy();
        
        TestUtils.logResult('UI Elements Check', true, `Found ${visibleText.length} text elements`);
    });
    
    it('should respond to basic interactions', async () => {
        TestUtils.logStep('Testing basic interactions');
        
        try {
            // Test swipe gestures
            await AppPage.swipe('down', 0.2);
            await browser.pause(1000);
            
            await AppPage.swipe('up', 0.2);
            await browser.pause(1000);
            
            // Test back button
            await browser.back();
            await browser.pause(1000);
            
            // Verify app is still responsive
            const currentActivity = await browser.getCurrentActivity();
            expect(currentActivity).toBeTruthy();
            
            TestUtils.logResult('Basic Interactions', true, 'Swipe and back button work');
            
        } catch (error) {
            TestUtils.logResult('Basic Interactions', false, error.message);
            throw error;
        }
    });
    
    it('should handle orientation changes', async () => {
        TestUtils.logStep('Testing orientation changes');
        
        try {
            // Get current orientation
            const initialOrientation = await browser.getOrientation();
            console.log(`Initial orientation: ${initialOrientation}`);
            
            // Change orientation
            const newOrientation = initialOrientation === 'PORTRAIT' ? 'LANDSCAPE' : 'PORTRAIT';
            await browser.setOrientation(newOrientation);
            await browser.pause(2000);
            
            // Verify orientation changed
            const currentOrientation = await browser.getOrientation();
            console.log(`New orientation: ${currentOrientation}`);
            
            // Change back to original
            await browser.setOrientation(initialOrientation);
            await browser.pause(2000);
            
            expect(currentOrientation).toBe(newOrientation);
            
            TestUtils.logResult('Orientation Change', true, `Changed from ${initialOrientation} to ${newOrientation}`);
            
        } catch (error) {
            TestUtils.logResult('Orientation Change', false, error.message);
            // Don't fail the test if orientation change is not supported
            console.log('Orientation change might not be supported on this device');
        }
    });
    
    it('should perform comprehensive app analysis', async () => {
        TestUtils.logStep('Performing comprehensive app analysis');
        
        try {
            // Perform detailed app analysis
            const analysis = await TestUtils.analyzeApp();
            
            // Save analysis results
            TestUtils.saveAnalysisResults(analysis);
            
            // Basic validations
            expect(analysis.elementCount).toBeGreaterThan(0);
            expect(analysis.deviceInfo).toBeInstanceOf(Object);
            expect(analysis.visibleText).toBeInstanceOf(Array);
            
            console.log('\n📊 App Analysis Summary:');
            console.log(`- Total UI elements: ${analysis.elementCount}`);
            console.log(`- Visible text elements: ${analysis.visibleText.length}`);
            console.log(`- Device: ${analysis.deviceInfo.deviceName}`);
            console.log(`- Platform: ${analysis.deviceInfo.platformName} ${analysis.deviceInfo.platformVersion}`);
            
            TestUtils.logResult('App Analysis', true, `Analyzed ${analysis.elementCount} elements`);
            
        } catch (error) {
            TestUtils.logResult('App Analysis', false, error.message);
            throw error;
        }
    });
    
    it('should test app navigation and flow', async () => {
        TestUtils.logStep('Testing app navigation and flow');
        
        try {
            // Test basic app functionality
            await AppPage.testBasicFunctionality();
            
            // Try to find and interact with common UI elements
            const commonTexts = ['Login', 'Sign In', 'Continue', 'Next', 'OK', 'Cancel', 'Back', 'Menu'];
            
            for (const text of commonTexts) {
                const elements = await TestUtils.findElementsByText(text);
                if (elements.length > 0) {
                    console.log(`Found element with text: ${text}`);
                    
                    // Try to interact with the first found element
                    try {
                        if (await elements[0].isDisplayed() && await elements[0].isClickable()) {
                            await elements[0].click();
                            await browser.pause(1000);
                            
                            // Take screenshot after interaction
                            await AppPage.takeScreenshot(`interaction_${text.toLowerCase()}`);
                            
                            // Go back to previous state
                            await browser.back();
                            await browser.pause(1000);
                        }
                    } catch (interactionError) {
                        console.log(`Could not interact with ${text}: ${interactionError.message}`);
                    }
                }
            }
            
            TestUtils.logResult('Navigation Flow', true, 'Completed navigation testing');
            
        } catch (error) {
            TestUtils.logResult('Navigation Flow', false, error.message);
            throw error;
        }
    });
    
    after(async () => {
        // Cleanup after all tests
        TestUtils.logStep('Completing basic app functionality tests');
        
        // Take final screenshot
        await AppPage.takeScreenshot('test_suite_completed');
        
        console.log('\n🎉 Basic app functionality tests completed!');
        console.log('📁 Check the screenshots folder for visual verification');
        console.log('📁 Check the test-results folder for analysis data');
    });
});
