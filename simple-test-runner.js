#!/usr/bin/env node

/**
 * Simple Test Runner - Direct WebDriverIO without framework
 * Runs tests directly using WebDriverIO remote connection
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

class SimpleTestRunner {
    constructor() {
        this.driver = null;
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        };
    }

    async connect() {
        console.log('🚀 Connecting to Appium server...');
        this.driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities
        });
        console.log('✅ Connected successfully!');
    }

    async disconnect() {
        if (this.driver) {
            console.log('🔌 Disconnecting...');
            await this.driver.deleteSession();
        }
    }

    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}_${timestamp}.png`;
        await this.driver.saveScreenshot(`./screenshots/${filename}`);
        console.log(`📸 Screenshot saved: ${filename}`);
        return filename;
    }

    async runTest(testName, testFunction) {
        console.log(`\n🧪 Running test: ${testName}`);
        const testResult = {
            name: testName,
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            await testFunction();
            testResult.status = 'passed';
            testResult.endTime = new Date().toISOString();
            this.testResults.summary.passed++;
            console.log(`✅ ${testName} - PASSED`);
        } catch (error) {
            testResult.status = 'failed';
            testResult.error = error.message;
            testResult.endTime = new Date().toISOString();
            this.testResults.summary.failed++;
            console.log(`❌ ${testName} - FAILED: ${error.message}`);
        }

        this.testResults.tests.push(testResult);
        this.testResults.summary.total++;
        
        // Take screenshot after each test
        await this.takeScreenshot(`test_${testName.replace(/\s+/g, '_')}_${testResult.status}`);
    }

    async runAllTests() {
        console.log('🎯 Starting Production Data Collection App Tests');
        console.log('='.repeat(60));

        try {
            await this.connect();
            
            // Wait for app to load
            console.log('⏳ Waiting for app to load...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Test 1: App Launch Verification
            await this.runTest('App Launch Verification', async () => {
                const currentActivity = await this.driver.getCurrentActivity();
                const currentPackage = await this.driver.getCurrentPackage();
                
                console.log(`Current Activity: ${currentActivity}`);
                console.log(`Current Package: ${currentPackage}`);
                
                if (currentPackage !== 'com.eekifoods.dev') {
                    throw new Error(`Expected package com.eekifoods.dev, got ${currentPackage}`);
                }
                
                if (currentActivity !== 'com.eekifoods.MainActivity') {
                    throw new Error(`Expected activity com.eekifoods.MainActivity, got ${currentActivity}`);
                }
            });

            // Test 2: Main Title Verification
            await this.runTest('Main Title Verification', async () => {
                const titleElement = await this.driver.$('//android.widget.TextView[@text="Production Data Collection"]');
                const isDisplayed = await titleElement.isDisplayed();
                
                if (!isDisplayed) {
                    throw new Error('Main title "Production Data Collection" is not displayed');
                }
                
                const titleText = await titleElement.getText();
                if (titleText !== 'Production Data Collection') {
                    throw new Error(`Expected title "Production Data Collection", got "${titleText}"`);
                }
            });

            // Test 3: Specimen Section Test
            await this.runTest('Specimen Section Interaction', async () => {
                const specimenSection = await this.driver.$('//*[@content-desc="󰹢, 󰐕, Specimen"]');
                const isDisplayed = await specimenSection.isDisplayed();
                const isClickable = await specimenSection.isClickable();
                
                if (!isDisplayed) {
                    throw new Error('Specimen section is not displayed');
                }
                
                if (!isClickable) {
                    throw new Error('Specimen section is not clickable');
                }
                
                // Click the specimen section
                await specimenSection.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Verify we can still see the specimen text
                const specimenText = await this.driver.$('//android.widget.TextView[@text="Specimen"]');
                const textDisplayed = await specimenText.isDisplayed();
                
                if (!textDisplayed) {
                    throw new Error('Specimen text not visible after click');
                }
            });

            // Test 4: Dome Section Test
            await this.runTest('Dome Section Interaction', async () => {
                const domeSection = await this.driver.$('//*[@content-desc="Dome"]');
                const isDisplayed = await domeSection.isDisplayed();
                const isClickable = await domeSection.isClickable();
                
                if (!isDisplayed) {
                    throw new Error('Dome section is not displayed');
                }
                
                if (!isClickable) {
                    throw new Error('Dome section is not clickable');
                }
                
                // Click the dome section
                await domeSection.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Verify dome text is visible
                const domeText = await this.driver.$('//android.widget.TextView[@text="Dome"]');
                const textDisplayed = await domeText.isDisplayed();
                
                if (!textDisplayed) {
                    throw new Error('Dome text not visible after click');
                }
            });

            // Test 5: Harvesting Section Test
            await this.runTest('Harvesting Section Interaction', async () => {
                const harvestingSection = await this.driver.$('//*[@content-desc="Harvesting"]');
                const isDisplayed = await harvestingSection.isDisplayed();
                const isClickable = await harvestingSection.isClickable();
                
                if (!isDisplayed) {
                    throw new Error('Harvesting section is not displayed');
                }
                
                if (!isClickable) {
                    throw new Error('Harvesting section is not clickable');
                }
                
                // Click the harvesting section
                await harvestingSection.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Verify harvesting text is visible
                const harvestingText = await this.driver.$('//android.widget.TextView[@text="Harvesting"]');
                const textDisplayed = await harvestingText.isDisplayed();
                
                if (!textDisplayed) {
                    throw new Error('Harvesting text not visible after click');
                }
            });

            // Test 6: Media Moisture Section Test
            await this.runTest('Media Moisture Section Interaction', async () => {
                const mediaMoistureSection = await this.driver.$('//*[@content-desc="Media Moisture"]');
                const isDisplayed = await mediaMoistureSection.isDisplayed();
                const isClickable = await mediaMoistureSection.isClickable();
                
                if (!isDisplayed) {
                    throw new Error('Media Moisture section is not displayed');
                }
                
                if (!isClickable) {
                    throw new Error('Media Moisture section is not clickable');
                }
                
                // Click the media moisture section
                await mediaMoistureSection.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Verify media moisture text is visible
                const mediaMoistureText = await this.driver.$('//android.widget.TextView[@text="Media Moisture"]');
                const textDisplayed = await mediaMoistureText.isDisplayed();
                
                if (!textDisplayed) {
                    throw new Error('Media Moisture text not visible after click');
                }
            });

            // Test 7: Icon Buttons Test
            await this.runTest('Icon Buttons Functionality', async () => {
                const iconButtons = await this.driver.$$('//android.widget.Button[@resource-id="icon-button"]');
                
                if (iconButtons.length === 0) {
                    throw new Error('No icon buttons found');
                }
                
                console.log(`Found ${iconButtons.length} icon buttons`);
                
                let enabledButtons = 0;
                let disabledButtons = 0;
                
                for (let i = 0; i < iconButtons.length; i++) {
                    const button = iconButtons[i];
                    const isDisplayed = await button.isDisplayed();
                    const isEnabled = await button.isEnabled();
                    const isClickable = await button.isClickable();
                    
                    console.log(`Button ${i + 1}: displayed=${isDisplayed}, enabled=${isEnabled}, clickable=${isClickable}`);
                    
                    if (isEnabled) {
                        enabledButtons++;
                    } else {
                        disabledButtons++;
                    }
                }
                
                // We expect to find some buttons (even if disabled)
                if (iconButtons.length < 3) {
                    throw new Error(`Expected at least 3 icon buttons, found ${iconButtons.length}`);
                }
            });

            // Test 8: Navigation and Back Button Test
            await this.runTest('Navigation and Back Button', async () => {
                // Click on specimen section
                const specimenSection = await this.driver.$('//*[@content-desc="󰹢, 󰐕, Specimen"]');
                await specimenSection.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Use back button
                await this.driver.back();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Verify we're back to main screen
                const mainTitle = await this.driver.$('//android.widget.TextView[@text="Production Data Collection"]');
                const titleDisplayed = await mainTitle.isDisplayed();
                
                if (!titleDisplayed) {
                    throw new Error('Main title not visible after back navigation');
                }
            });

            // Test 9: Scroll Test
            await this.runTest('Scroll Functionality', async () => {
                const { width, height } = await this.driver.getWindowSize();
                
                // Test scroll down
                await this.driver.touchAction([
                    { action: 'press', x: width / 2, y: height * 0.7 },
                    { action: 'wait', ms: 1000 },
                    { action: 'moveTo', x: width / 2, y: height * 0.3 },
                    { action: 'release' }
                ]);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Test scroll up
                await this.driver.touchAction([
                    { action: 'press', x: width / 2, y: height * 0.3 },
                    { action: 'wait', ms: 1000 },
                    { action: 'moveTo', x: width / 2, y: height * 0.7 },
                    { action: 'release' }
                ]);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Verify main title is still visible
                const mainTitle = await this.driver.$('//android.widget.TextView[@text="Production Data Collection"]');
                const titleDisplayed = await mainTitle.isDisplayed();
                
                if (!titleDisplayed) {
                    throw new Error('Main title not visible after scrolling');
                }
            });

        } catch (error) {
            console.error('❌ Test execution error:', error.message);
        } finally {
            await this.disconnect();
        }

        // Generate final report
        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 TEST EXECUTION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.testResults.summary.total}`);
        console.log(`Passed: ${this.testResults.summary.passed}`);
        console.log(`Failed: ${this.testResults.summary.failed}`);
        
        const successRate = this.testResults.summary.total > 0 ? 
            (this.testResults.summary.passed / this.testResults.summary.total) * 100 : 0;
        console.log(`Success Rate: ${successRate.toFixed(1)}%`);

        console.log('\n📋 Test Details:');
        this.testResults.tests.forEach((test, index) => {
            const status = test.status === 'passed' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${test.name}`);
            if (test.error) {
                console.log(`   Error: ${test.error}`);
            }
        });

        // Save results
        if (!fs.existsSync('./test-results')) {
            fs.mkdirSync('./test-results', { recursive: true });
        }
        
        fs.writeFileSync(
            './test-results/simple_test_results.json',
            JSON.stringify(this.testResults, null, 2)
        );

        console.log('\n📁 Generated Files:');
        console.log('- Test Results: ./test-results/simple_test_results.json');
        console.log('- Screenshots: ./screenshots/');

        if (successRate === 100) {
            console.log('\n🎉 ALL TESTS PASSED! Excellent!');
        } else if (successRate >= 80) {
            console.log('\n👍 Most tests passed. Great job!');
        } else {
            console.log('\n⚠️ Several tests failed. Please review the issues.');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new SimpleTestRunner();
    runner.runAllTests().catch(error => {
        console.error('❌ Test runner error:', error);
        process.exit(1);
    });
}

module.exports = SimpleTestRunner;
