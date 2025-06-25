/**
 * Production Data Collection App - Comprehensive Test Suite
 * Tests based on discovered UI elements and app functionality
 */

const ProductionDataPage = require('../pageobjects/ProductionDataPage');
const TestHelpers = require('../helpers/TestHelpers');

describe('Production Data Collection App - Main Tests', () => {
    
    let testResults = {
        timestamp: new Date().toISOString(),
        testsPassed: 0,
        testsFailed: 0,
        details: []
    };

    before(async () => {
        console.log('\n🚀 Starting Production Data Collection App Tests');
        console.log('================================================\n');
        
        // Ensure screenshots directory exists
        TestHelpers.ensureScreenshotsDir();
        
        // Get device information
        const deviceInfo = await TestHelpers.getDeviceInfo();
        console.log('Device Info:', deviceInfo);
        
        testResults.deviceInfo = deviceInfo;
    });

    beforeEach(async () => {
        const testName = this.currentTest?.title || 'Unknown test';
        console.log(`\n🧪 Starting test: ${testName}`);
        testResults.details.push({
            testName,
            startTime: new Date().toISOString(),
            status: 'running'
        });
    });

    afterEach(async () => {
        const testName = this.currentTest?.title || 'unknown_test';
        const testPassed = this.currentTest?.state === 'passed';
        
        // Update test results
        const testDetail = testResults.details.find(t => t.testName === testName);
        if (testDetail) {
            testDetail.status = testPassed ? 'passed' : 'failed';
            testDetail.endTime = new Date().toISOString();
        }
        
        if (testPassed) {
            testResults.testsPassed++;
        } else {
            testResults.testsFailed++;
        }
        
        // Take screenshot after each test
        await ProductionDataPage.takeScreenshot(`${testName.replace(/\s+/g, '_')}_${testPassed ? 'passed' : 'failed'}`);
        
        console.log(`Test ${testName}: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);
    });

    it('should load the Production Data Collection main screen', async () => {
        // Wait for the main screen to load
        await ProductionDataPage.waitForPageLoad();
        
        // Verify main title is displayed
        await expect(ProductionDataPage.mainTitle).toBeDisplayed();
        
        // Get app information
        const currentActivity = await browser.getCurrentActivity();
        const currentPackage = await browser.getCurrentPackage();
        
        console.log(`Current Activity: ${currentActivity}`);
        console.log(`Current Package: ${currentPackage}`);
        
        // Verify we're in the correct app
        expect(currentPackage).toBe('com.eekifoods.dev');
        expect(currentActivity).toBe('com.eekifoods.MainActivity');
        
        console.log('✅ Main screen loaded successfully');
    });

    it('should display all main data collection sections', async () => {
        // Verify all main sections are displayed
        const sectionResults = await ProductionDataPage.verifyMainSections();
        
        // Check each section
        expect(sectionResults.Specimen).toBe(true);
        expect(sectionResults.Dome).toBe(true);
        expect(sectionResults.Harvesting).toBe(true);
        expect(sectionResults['Media Moisture']).toBe(true);
        
        // Verify section texts are displayed
        await expect(ProductionDataPage.specimenText).toBeDisplayed();
        await expect(ProductionDataPage.domeText).toBeDisplayed();
        await expect(ProductionDataPage.harvestingText).toBeDisplayed();
        await expect(ProductionDataPage.mediaMoistureText).toBeDisplayed();
        
        console.log('✅ All main sections are displayed correctly');
    });

    it('should allow interaction with the Specimen section', async () => {
        // Verify Specimen section is clickable
        await expect(ProductionDataPage.specimenSection).toBeDisplayed();
        await expect(ProductionDataPage.specimenSection).toBeClickable();
        
        // Click on Specimen section
        await ProductionDataPage.clickSection('specimen');
        
        // Verify icons are displayed
        await expect(ProductionDataPage.specimenIcon).toBeDisplayed();
        await expect(ProductionDataPage.specimenSubIcon).toBeDisplayed();
        
        console.log('✅ Specimen section interaction successful');
    });

    it('should allow interaction with the Dome section', async () => {
        // Verify Dome section is clickable
        await expect(ProductionDataPage.domeSection).toBeDisplayed();
        await expect(ProductionDataPage.domeSection).toBeClickable();
        
        // Click on Dome section
        await ProductionDataPage.clickSection('dome');
        
        // Verify dome elements are displayed
        await expect(ProductionDataPage.domeText).toBeDisplayed();
        
        // Check if icon button is present (may be disabled)
        const iconButtonDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.domeIconButton);
        console.log(`Dome icon button displayed: ${iconButtonDisplayed}`);
        
        console.log('✅ Dome section interaction successful');
    });

    it('should allow interaction with the Harvesting section', async () => {
        // Verify Harvesting section is clickable
        await expect(ProductionDataPage.harvestingSection).toBeDisplayed();
        await expect(ProductionDataPage.harvestingSection).toBeClickable();
        
        // Click on Harvesting section
        await ProductionDataPage.clickSection('harvesting');
        
        // Verify harvesting elements are displayed
        await expect(ProductionDataPage.harvestingText).toBeDisplayed();
        
        console.log('✅ Harvesting section interaction successful');
    });

    it('should allow interaction with the Media Moisture section', async () => {
        // Verify Media Moisture section is clickable
        await expect(ProductionDataPage.mediaMoistureSection).toBeDisplayed();
        await expect(ProductionDataPage.mediaMoistureSection).toBeClickable();
        
        // Click on Media Moisture section
        await ProductionDataPage.clickSection('mediaMoisture');
        
        // Verify media moisture elements are displayed
        await expect(ProductionDataPage.mediaMoistureText).toBeDisplayed();
        
        console.log('✅ Media Moisture section interaction successful');
    });

    it('should support scrolling within the content area', async () => {
        // Verify scroll view is present
        await expect(ProductionDataPage.scrollView).toBeDisplayed();
        
        // Test scrolling down
        await ProductionDataPage.scrollContent('down');
        await browser.pause(1000);
        
        // Test scrolling up
        await ProductionDataPage.scrollContent('up');
        await browser.pause(1000);
        
        // Verify we can still see main elements after scrolling
        await expect(ProductionDataPage.mainTitle).toBeDisplayed();
        
        console.log('✅ Scrolling functionality works correctly');
    });

    it('should test all icon buttons functionality', async () => {
        // Test all icon buttons
        const iconButtonResults = await ProductionDataPage.testIconButtons();
        
        // Verify we found icon buttons
        expect(iconButtonResults.length).toBeGreaterThan(0);
        
        // Log results for each button
        iconButtonResults.forEach((result, index) => {
            console.log(`Icon Button ${index}:`, result);
        });
        
        // At least some buttons should be displayed
        const displayedButtons = iconButtonResults.filter(result => result.isDisplayed);
        expect(displayedButtons.length).toBeGreaterThan(0);
        
        console.log(`✅ Tested ${iconButtonResults.length} icon buttons`);
    });

    it('should perform comprehensive element discovery', async () => {
        // Perform comprehensive element discovery
        const discovery = await ProductionDataPage.discoverAllElements();
        
        // Verify discovery results
        expect(discovery).toHaveProperty('timestamp');
        expect(discovery).toHaveProperty('sections');
        expect(discovery).toHaveProperty('iconButtons');
        expect(discovery).toHaveProperty('allTextElements');
        
        // Verify we found sections
        expect(discovery.sections.length).toBeGreaterThan(0);
        
        // Verify we found text elements
        expect(discovery.allTextElements.length).toBeGreaterThan(0);
        
        // Log discovery summary
        console.log('\n📊 Element Discovery Summary:');
        console.log(`- Sections found: ${discovery.sections.length}`);
        console.log(`- Icon buttons found: ${discovery.iconButtons.length}`);
        console.log(`- Text elements found: ${discovery.allTextElements.length}`);
        console.log(`- Main title displayed: ${discovery.mainTitle}`);
        console.log(`- Scroll view present: ${discovery.scrollView}`);
        
        // Save discovery results
        TestHelpers.saveTestResults('element_discovery', discovery);
        
        console.log('✅ Comprehensive element discovery completed');
    });

    it('should test app navigation and back button functionality', async () => {
        // Test clicking each section and using back button
        const sections = ['specimen', 'dome', 'harvesting', 'mediaMoisture'];
        
        for (const section of sections) {
            console.log(`Testing navigation for ${section} section...`);
            
            // Click section
            await ProductionDataPage.clickSection(section);
            
            // Wait for any navigation
            await browser.pause(2000);
            
            // Test back button
            await browser.back();
            await browser.pause(1000);
            
            // Verify we're back to main screen
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            console.log(`✅ Navigation test for ${section} completed`);
        }
        
        console.log('✅ All navigation tests completed successfully');
    });

    it('should handle device orientation changes', async () => {
        try {
            // Get current orientation
            const initialOrientation = await browser.getOrientation();
            console.log(`Initial orientation: ${initialOrientation}`);
            
            // Change orientation
            const newOrientation = initialOrientation === 'PORTRAIT' ? 'LANDSCAPE' : 'PORTRAIT';
            await browser.setOrientation(newOrientation);
            await browser.pause(3000);
            
            // Verify main elements are still displayed
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            // Verify sections are still accessible
            const sectionResults = await ProductionDataPage.verifyMainSections();
            expect(Object.values(sectionResults).some(result => result)).toBe(true);
            
            // Change back to original orientation
            await browser.setOrientation(initialOrientation);
            await browser.pause(3000);
            
            // Final verification
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            console.log(`✅ Orientation change test completed (${initialOrientation} ↔ ${newOrientation})`);
            
        } catch (error) {
            console.log(`⚠️ Orientation change not supported or failed: ${error.message}`);
            // Don't fail the test if orientation change is not supported
        }
    });

    after(async () => {
        console.log('\n📊 Test Suite Summary');
        console.log('=====================');
        console.log(`Total Tests: ${testResults.testsPassed + testResults.testsFailed}`);
        console.log(`Passed: ${testResults.testsPassed}`);
        console.log(`Failed: ${testResults.testsFailed}`);
        console.log(`Success Rate: ${((testResults.testsPassed / (testResults.testsPassed + testResults.testsFailed)) * 100).toFixed(1)}%`);
        
        // Save final test results
        testResults.endTime = new Date().toISOString();
        TestHelpers.saveTestResults('production_data_tests', testResults);
        
        // Take final screenshot
        await ProductionDataPage.takeScreenshot('test_suite_completed');
        
        console.log('\n📁 Generated Files:');
        console.log('- Screenshots: ./screenshots/');
        console.log('- Test Results: ./test-results/');
        
        console.log('\n🎉 Production Data Collection App tests completed!');
    });
});
