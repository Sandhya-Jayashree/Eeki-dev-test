/**
 * Test Helpers
 * Common utilities for testing
 */

const fs = require('fs');
const path = require('path');

class TestHelpers {
    static async waitForElement(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
    }

    static async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await browser.saveScreenshot(`./screenshots/${name}_${timestamp}.png`);
    }

    static async scrollDown() {
        const { width, height } = await browser.getWindowSize();
        await browser.touchAction([
            { action: 'press', x: width / 2, y: height * 0.7 },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: width / 2, y: height * 0.3 },
            { action: 'release' }
        ]);
        await browser.pause(1000);
    }

    static async scrollUp() {
        const { width, height } = await browser.getWindowSize();
        await browser.touchAction([
            { action: 'press', x: width / 2, y: height * 0.3 },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: width / 2, y: height * 0.7 },
            { action: 'release' }
        ]);
        await browser.pause(1000);
    }

    static generateTestData() {
        return {
            text: `Test_${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            number: Math.floor(Math.random() * 1000).toString(),
            date: new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Ensure screenshots directory exists
     */
    static ensureScreenshotsDir() {
        const dirs = ['screenshots', 'test-results'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Get device information
     */
    static async getDeviceInfo() {
        try {
            return {
                platformName: await browser.capabilities.platformName,
                platformVersion: await browser.capabilities.platformVersion,
                deviceName: await browser.capabilities.deviceName,
                orientation: await browser.getOrientation(),
                windowSize: await browser.getWindowSize()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get all visible text elements
     */
    static async getAllVisibleText() {
        try {
            const textElements = await $$('//android.widget.TextView[@text]');
            const visibleText = [];

            for (const element of textElements.slice(0, 20)) {
                try {
                    if (await element.isDisplayed()) {
                        const text = await element.getText();
                        if (text && text.trim()) {
                            visibleText.push(text.trim());
                        }
                    }
                } catch (error) {
                    // Continue with next element
                }
            }

            return visibleText;
        } catch (error) {
            return [];
        }
    }

    /**
     * Find elements by text
     */
    static async findElementsByText(text) {
        try {
            return await $$(`//android.widget.*[@text="${text}"]`);
        } catch (error) {
            return [];
        }
    }

    /**
     * Log test step
     */
    static logStep(message) {
        console.log(`🔍 ${message}`);
    }

    /**
     * Log test result
     */
    static logResult(testName, passed, details = '') {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status} - ${testName}${details ? ` (${details})` : ''}`);
    }

    /**
     * Save test results to JSON file
     */
    static saveTestResults(filename, data) {
        try {
            this.ensureScreenshotsDir();
            const filePath = path.join('./test-results', `${filename}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`💾 Test results saved to: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error saving test results: ${error.message}`);
        }
    }

    /**
     * Get comprehensive app analysis
     */
    static async analyzeApp() {
        try {
            const analysis = {
                timestamp: new Date().toISOString(),
                deviceInfo: await this.getDeviceInfo(),
                visibleText: await this.getAllVisibleText(),
                elementCount: 0,
                appInfo: {
                    package: await browser.getCurrentPackage(),
                    activity: await browser.getCurrentActivity(),
                    orientation: await browser.getOrientation(),
                    windowSize: await browser.getWindowSize()
                }
            };

            // Count UI elements
            try {
                const allElements = await $$('//android.widget.*');
                analysis.elementCount = allElements.length;
            } catch (error) {
                analysis.elementCount = 0;
            }

            return analysis;
        } catch (error) {
            console.error(`❌ Error analyzing app: ${error.message}`);
            return { error: error.message };
        }
    }

    /**
     * Save analysis results
     */
    static saveAnalysisResults(analysis) {
        this.saveTestResults('app_analysis', analysis);
    }
}

module.exports = TestHelpers;
