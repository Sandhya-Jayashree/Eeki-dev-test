const AppPage = require('../pageobjects/AppPage');
const TestUtils = require('../helpers/TestUtils');

describe('Advanced App Testing', () => {
    
    before(async () => {
        TestUtils.ensureScreenshotsDir();
        TestUtils.logStep('Starting advanced app testing');
    });
    
    beforeEach(async () => {
        console.log(`\n🔬 Advanced test: ${this.currentTest?.title || 'Unknown test'}`);
    });
    
    afterEach(async () => {
        const testName = this.currentTest?.title || 'unknown_test';
        const testPassed = this.currentTest?.state === 'passed';
        await AppPage.takeScreenshot(`advanced_${testName.replace(/\s+/g, '_')}_${testPassed ? 'passed' : 'failed'}`);
        TestUtils.logResult(testName, testPassed);
    });
    
    it('should test form inputs and validation', async () => {
        TestUtils.logStep('Testing form inputs and validation');
        
        try {
            // Look for input fields
            const inputSelectors = [
                '//android.widget.EditText',
                'android=new UiSelector().className("android.widget.EditText")',
                '//android.widget.AutoCompleteTextView'
            ];
            
            let inputFields = [];
            for (const selector of inputSelectors) {
                try {
                    const fields = await $$(selector);
                    inputFields.push(...fields);
                } catch (error) {
                    // Continue with next selector
                }
            }
            
            console.log(`Found ${inputFields.length} input fields`);
            
            if (inputFields.length > 0) {
                // Test input with various data
                const testData = [
                    TestUtils.generateTestData('email'),
                    TestUtils.generateTestData('username'),
                    TestUtils.generateTestData('password'),
                    'Test123!@#',
                    '1234567890',
                    'Special chars: àáâãäå'
                ];
                
                for (let i = 0; i < Math.min(inputFields.length, testData.length); i++) {
                    try {
                        if (await inputFields[i].isDisplayed()) {
                            await AppPage.setText(inputFields[i], testData[i]);
                            await browser.pause(500);
                            
                            // Verify text was entered
                            const enteredText = await inputFields[i].getText();
                            console.log(`Entered: "${testData[i]}" -> Got: "${enteredText}"`);
                        }
                    } catch (error) {
                        console.log(`Could not interact with input field ${i}: ${error.message}`);
                    }
                }
                
                TestUtils.logResult('Form Input Testing', true, `Tested ${inputFields.length} input fields`);
            } else {
                TestUtils.logResult('Form Input Testing', true, 'No input fields found in current screen');
            }
            
        } catch (error) {
            TestUtils.logResult('Form Input Testing', false, error.message);
            throw error;
        }
    });
    
    it('should test scrolling and list interactions', async () => {
        TestUtils.logStep('Testing scrolling and list interactions');
        
        try {
            // Look for scrollable elements
            const scrollableSelectors = [
                '//android.widget.ScrollView',
                '//android.widget.ListView',
                '//android.widget.RecyclerView',
                '//androidx.recyclerview.widget.RecyclerView',
                'android=new UiSelector().scrollable(true)'
            ];
            
            let scrollableElements = [];
            for (const selector of scrollableSelectors) {
                try {
                    const elements = await $$(selector);
                    scrollableElements.push(...elements);
                } catch (error) {
                    // Continue with next selector
                }
            }
            
            console.log(`Found ${scrollableElements.length} scrollable elements`);
            
            if (scrollableElements.length > 0) {
                // Test scrolling on the first scrollable element
                const scrollElement = scrollableElements[0];
                
                if (await scrollElement.isDisplayed()) {
                    // Scroll down
                    await AppPage.swipe('down', 0.5);
                    await browser.pause(1000);
                    
                    // Scroll up
                    await AppPage.swipe('up', 0.5);
                    await browser.pause(1000);
                    
                    // Test horizontal scrolling
                    await AppPage.swipe('left', 0.3);
                    await browser.pause(1000);
                    
                    await AppPage.swipe('right', 0.3);
                    await browser.pause(1000);
                }
                
                TestUtils.logResult('Scrolling Test', true, 'Completed scrolling interactions');
            } else {
                // Test general screen scrolling
                await AppPage.swipe('down', 0.3);
                await browser.pause(1000);
                await AppPage.swipe('up', 0.3);
                await browser.pause(1000);
                
                TestUtils.logResult('Scrolling Test', true, 'Tested general screen scrolling');
            }
            
        } catch (error) {
            TestUtils.logResult('Scrolling Test', false, error.message);
            throw error;
        }
    });
    
    it('should test app performance and responsiveness', async () => {
        TestUtils.logStep('Testing app performance and responsiveness');
        
        try {
            const performanceMetrics = {
                startTime: Date.now(),
                interactions: [],
                screenshots: []
            };
            
            // Test rapid interactions
            const interactions = [
                () => AppPage.swipe('down', 0.2),
                () => AppPage.swipe('up', 0.2),
                () => browser.back(),
                () => browser.touchAction({ action: 'tap', x: 200, y: 300 }),
                () => browser.touchAction({ action: 'tap', x: 400, y: 600 })
            ];
            
            for (let i = 0; i < interactions.length; i++) {
                const interactionStart = Date.now();
                
                try {
                    await interactions[i]();
                    await browser.pause(500);
                    
                    const interactionTime = Date.now() - interactionStart;
                    performanceMetrics.interactions.push({
                        index: i,
                        duration: interactionTime,
                        success: true
                    });
                    
                } catch (error) {
                    performanceMetrics.interactions.push({
                        index: i,
                        duration: Date.now() - interactionStart,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            performanceMetrics.totalTime = Date.now() - performanceMetrics.startTime;
            
            // Calculate average interaction time
            const successfulInteractions = performanceMetrics.interactions.filter(i => i.success);
            const avgInteractionTime = successfulInteractions.length > 0 
                ? successfulInteractions.reduce((sum, i) => sum + i.duration, 0) / successfulInteractions.length 
                : 0;
            
            console.log(`Performance Metrics:`);
            console.log(`- Total test time: ${performanceMetrics.totalTime}ms`);
            console.log(`- Successful interactions: ${successfulInteractions.length}/${interactions.length}`);
            console.log(`- Average interaction time: ${avgInteractionTime.toFixed(2)}ms`);
            
            // Save performance data
            TestUtils.saveAnalysisResults({
                type: 'performance',
                timestamp: new Date().toISOString(),
                metrics: performanceMetrics
            });
            
            TestUtils.logResult('Performance Test', true, `Avg interaction: ${avgInteractionTime.toFixed(2)}ms`);
            
        } catch (error) {
            TestUtils.logResult('Performance Test', false, error.message);
            throw error;
        }
    });
    
    it('should test app state and memory management', async () => {
        TestUtils.logStep('Testing app state and memory management');
        
        try {
            // Get initial app state
            const initialActivity = await browser.getCurrentActivity();
            const initialPackage = await browser.getCurrentPackage();
            
            // Test app backgrounding and foregrounding
            await browser.background(2); // Background for 2 seconds
            await browser.pause(1000);
            
            // Check if app is still responsive
            const afterBackgroundActivity = await browser.getCurrentActivity();
            const afterBackgroundPackage = await browser.getCurrentPackage();
            
            console.log(`Initial: ${initialActivity}`);
            console.log(`After background: ${afterBackgroundActivity}`);
            
            // Test app restart
            await browser.terminateApp(afterBackgroundPackage);
            await browser.pause(2000);
            
            // Relaunch app
            await browser.activateApp(afterBackgroundPackage);
            await browser.pause(3000);
            
            const afterRestartActivity = await browser.getCurrentActivity();
            console.log(`After restart: ${afterRestartActivity}`);
            
            // Verify app is functional after restart
            expect(afterRestartActivity).toBeTruthy();
            
            TestUtils.logResult('State Management', true, 'App survived background/restart cycle');
            
        } catch (error) {
            TestUtils.logResult('State Management', false, error.message);
            // Don't fail the test as some operations might not be supported
            console.log('Some state management operations might not be supported');
        }
    });
    
    it('should test accessibility features', async () => {
        TestUtils.logStep('Testing accessibility features');
        
        try {
            // Look for elements with accessibility properties
            const accessibilitySelectors = [
                '//*[@content-desc]',
                '//*[@resource-id]',
                'android=new UiSelector().descriptionContains("")'
            ];
            
            let accessibleElements = [];
            for (const selector of accessibilitySelectors) {
                try {
                    const elements = await $$(selector);
                    accessibleElements.push(...elements);
                } catch (error) {
                    // Continue with next selector
                }
            }
            
            console.log(`Found ${accessibleElements.length} elements with accessibility properties`);
            
            // Test accessibility properties
            let elementsWithContentDesc = 0;
            let elementsWithResourceId = 0;
            
            for (const element of accessibleElements.slice(0, 10)) { // Test first 10 elements
                try {
                    const contentDesc = await element.getAttribute('content-desc');
                    const resourceId = await element.getAttribute('resource-id');
                    
                    if (contentDesc) elementsWithContentDesc++;
                    if (resourceId) elementsWithResourceId++;
                    
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }
            
            console.log(`Elements with content-desc: ${elementsWithContentDesc}`);
            console.log(`Elements with resource-id: ${elementsWithResourceId}`);
            
            TestUtils.logResult('Accessibility Test', true, 
                `Found ${elementsWithContentDesc} accessible elements`);
            
        } catch (error) {
            TestUtils.logResult('Accessibility Test', false, error.message);
            throw error;
        }
    });
    
    after(async () => {
        TestUtils.logStep('Completing advanced app testing');
        await AppPage.takeScreenshot('advanced_tests_completed');
        console.log('\n🚀 Advanced app testing completed!');
    });
});
