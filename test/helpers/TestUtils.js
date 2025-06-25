const fs = require('fs');
const path = require('path');

/**
 * Test Utilities Class
 * Contains helper methods for testing
 */
class TestUtils {
    
    /**
     * Create screenshots directory if it doesn't exist
     */
    static ensureScreenshotsDir() {
        const screenshotsDir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
            console.log('Created screenshots directory');
        }
    }
    
    /**
     * Wait for a specific condition to be true
     * @param {Function} condition - Function that returns boolean
     * @param {number} timeout - Timeout in milliseconds
     * @param {number} interval - Check interval in milliseconds
     * @returns {Promise<boolean>} True if condition met, false if timeout
     */
    static async waitForCondition(condition, timeout = 10000, interval = 500) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                if (await condition()) {
                    return true;
                }
            } catch (error) {
                // Ignore errors and continue waiting
            }
            
            await browser.pause(interval);
        }
        
        return false;
    }
    
    /**
     * Generate test data
     * @param {string} type - Type of test data to generate
     * @returns {string} Generated test data
     */
    static generateTestData(type) {
        const timestamp = Date.now();
        
        switch (type) {
            case 'email':
                return `test${timestamp}@example.com`;
            case 'username':
                return `user${timestamp}`;
            case 'password':
                return `Pass${timestamp}!`;
            case 'phone':
                return `555${timestamp.toString().slice(-7)}`;
            default:
                return `test_${timestamp}`;
        }
    }
    
    /**
     * Log test step
     * @param {string} step - Description of the test step
     */
    static logStep(step) {
        console.log(`\n📋 TEST STEP: ${step}`);
    }
    
    /**
     * Log test result
     * @param {string} test - Test name
     * @param {boolean} passed - Whether test passed
     * @param {string} message - Additional message
     */
    static logResult(test, passed, message = '') {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`\n${status}: ${test}`);
        if (message) {
            console.log(`   ${message}`);
        }
    }
    
    /**
     * Get device information
     * @returns {Promise<Object>} Device information
     */
    static async getDeviceInfo() {
        try {
            const deviceInfo = {
                platformName: await browser.capabilities.platformName,
                platformVersion: await browser.capabilities.platformVersion,
                deviceName: await browser.capabilities.deviceName,
                orientation: await browser.getOrientation(),
                windowSize: await browser.getWindowSize()
            };
            
            console.log('Device Information:', deviceInfo);
            return deviceInfo;
        } catch (error) {
            console.error('Error getting device info:', error.message);
            return {};
        }
    }
    
    /**
     * Find elements by different strategies
     * @param {string} text - Text to search for
     * @returns {Promise<Array>} Array of found elements
     */
    static async findElementsByText(text) {
        const strategies = [
            `//android.widget.TextView[@text="${text}"]`,
            `//android.widget.Button[@text="${text}"]`,
            `//android.widget.TextView[contains(@text, "${text}")]`,
            `//android.widget.Button[contains(@text, "${text}")]`,
            `android=new UiSelector().textContains("${text}")`,
            `android=new UiSelector().text("${text}")`
        ];
        
        const foundElements = [];
        
        for (const strategy of strategies) {
            try {
                const elements = await $$(strategy);
                if (elements.length > 0) {
                    foundElements.push(...elements);
                }
            } catch (error) {
                // Continue with next strategy
            }
        }
        
        return foundElements;
    }
    
    /**
     * Get all visible text on screen
     * @returns {Promise<Array>} Array of text content
     */
    static async getAllVisibleText() {
        try {
            const textElements = await $$('//android.widget.TextView | //android.widget.Button | //android.widget.EditText');
            const textContent = [];
            
            for (const element of textElements) {
                try {
                    if (await element.isDisplayed()) {
                        const text = await element.getText();
                        if (text && text.trim()) {
                            textContent.push(text.trim());
                        }
                    }
                } catch (error) {
                    // Skip elements that can't be accessed
                }
            }
            
            return textContent;
        } catch (error) {
            console.error('Error getting visible text:', error.message);
            return [];
        }
    }
    
    /**
     * Perform app analysis
     * @returns {Promise<Object>} Analysis results
     */
    static async analyzeApp() {
        console.log('\n🔍 Analyzing app structure...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            deviceInfo: await this.getDeviceInfo(),
            visibleText: await this.getAllVisibleText(),
            elementCount: 0,
            screenshots: []
        };
        
        try {
            // Count all elements
            const allElements = await $$('//android.widget.*');
            analysis.elementCount = allElements.length;
            
            // Take analysis screenshot
            const screenshotName = `app_analysis_${Date.now()}.png`;
            await browser.saveScreenshot(`./screenshots/${screenshotName}`);
            analysis.screenshots.push(screenshotName);
            
            console.log(`Found ${analysis.elementCount} UI elements`);
            console.log(`Visible text elements: ${analysis.visibleText.length}`);
            
        } catch (error) {
            console.error('Error during app analysis:', error.message);
        }
        
        return analysis;
    }
    
    /**
     * Save analysis results to file
     * @param {Object} analysis - Analysis results
     */
    static saveAnalysisResults(analysis) {
        const resultsDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }
        
        const filename = `app_analysis_${Date.now()}.json`;
        const filepath = path.join(resultsDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
        console.log(`Analysis results saved to: ${filename}`);
    }
}

module.exports = TestUtils;
