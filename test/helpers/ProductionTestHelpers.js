/**
 * Production Data Collection App - Test Helpers
 * Specialized utilities for testing the production data collection app
 */

const fs = require('fs');
const path = require('path');

class ProductionTestHelpers {
    
    /**
     * Ensure required directories exist
     */
    static ensureDirectories() {
        const dirs = ['screenshots', 'test-results', 'test-data'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    /**
     * Save test results to JSON file
     */
    static saveTestResults(filename, data) {
        try {
            this.ensureDirectories();
            const filePath = path.join('./test-results', `${filename}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`💾 Test results saved to: ${filePath}`);
        } catch (error) {
            console.error(`❌ Error saving test results: ${error.message}`);
        }
    }

    /**
     * Load test results from JSON file
     */
    static loadTestResults(filename) {
        try {
            const filePath = path.join('./test-results', `${filename}.json`);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            console.error(`❌ Error loading test results: ${error.message}`);
            return null;
        }
    }

    /**
     * Get comprehensive device and app information
     */
    static async getDeviceAndAppInfo() {
        try {
            const info = {
                timestamp: new Date().toISOString(),
                device: {
                    platformName: await browser.capabilities.platformName,
                    platformVersion: await browser.capabilities.platformVersion,
                    deviceName: await browser.capabilities.deviceName,
                    orientation: await browser.getOrientation(),
                    windowSize: await browser.getWindowSize()
                },
                app: {
                    package: await browser.getCurrentPackage(),
                    activity: await browser.getCurrentActivity(),
                    appPath: await browser.capabilities.app || 'Unknown'
                },
                session: {
                    sessionId: browser.sessionId,
                    capabilities: browser.capabilities
                }
            };
            
            console.log('📱 Device & App Info:', info);
            return info;
        } catch (error) {
            console.error(`❌ Error getting device info: ${error.message}`);
            return { error: error.message };
        }
    }

    /**
     * Take screenshot with timestamp and custom naming
     */
    static async takeScreenshot(name, description = '') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            const filePath = `./screenshots/${filename}`;
            
            await browser.saveScreenshot(filePath);
            
            const screenshotInfo = {
                filename,
                path: filePath,
                timestamp: new Date().toISOString(),
                description,
                windowSize: await browser.getWindowSize(),
                orientation: await browser.getOrientation()
            };
            
            console.log(`📸 Screenshot saved: ${filename}`);
            return screenshotInfo;
        } catch (error) {
            console.error(`❌ Error taking screenshot: ${error.message}`);
            return { error: error.message };
        }
    }

    /**
     * Wait for element with custom timeout and retry logic
     */
    static async waitForElement(element, timeout = 10000, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                await element.waitForDisplayed({ timeout });
                return true;
            } catch (error) {
                console.log(`⏳ Waiting for element (attempt ${i + 1}/${retries})`);
                if (i === retries - 1) {
                    throw error;
                }
                await browser.pause(1000);
            }
        }
        return false;
    }

    /**
     * Perform safe element interaction with error handling
     */
    static async safeElementInteraction(element, action = 'click', value = null) {
        try {
            // Wait for element to be displayed
            await this.waitForElement(element);
            
            // Check if element is enabled and clickable (for click actions)
            if (action === 'click') {
                const isClickable = await element.isClickable();
                const isEnabled = await element.isEnabled();
                
                if (!isClickable || !isEnabled) {
                    return {
                        success: false,
                        reason: `Element is not ${!isClickable ? 'clickable' : 'enabled'}`
                    };
                }
            }
            
            // Perform the action
            switch (action) {
                case 'click':
                    await element.click();
                    break;
                case 'setText':
                    await element.setValue(value);
                    break;
                case 'getText':
                    return { success: true, value: await element.getText() };
                case 'getAttribute':
                    return { success: true, value: await element.getAttribute(value) };
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            return { success: true };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze app performance during test execution
     */
    static async analyzeAppPerformance() {
        try {
            const startTime = Date.now();
            
            // Test app responsiveness
            const responsiveness = await this.testAppResponsiveness();
            
            // Test memory usage (if available)
            const memoryInfo = await this.getMemoryInfo();
            
            // Test navigation speed
            const navigationSpeed = await this.testNavigationSpeed();
            
            const endTime = Date.now();
            
            const performance = {
                timestamp: new Date().toISOString(),
                analysisTime: endTime - startTime,
                responsiveness,
                memoryInfo,
                navigationSpeed,
                overall: this.calculateOverallPerformance(responsiveness, navigationSpeed)
            };
            
            console.log('⚡ App Performance Analysis:', performance);
            return performance;
            
        } catch (error) {
            console.error(`❌ Error analyzing performance: ${error.message}`);
            return { error: error.message };
        }
    }

    /**
     * Test app responsiveness
     */
    static async testAppResponsiveness() {
        const tests = [];
        
        try {
            // Test 1: Screen tap responsiveness
            const tapStart = Date.now();
            const { width, height } = await browser.getWindowSize();
            await browser.touchAction({
                action: 'tap',
                x: width / 2,
                y: height / 2
            });
            const tapEnd = Date.now();
            tests.push({ test: 'tap_response', time: tapEnd - tapStart });
            
            // Test 2: Back button responsiveness
            const backStart = Date.now();
            await browser.back();
            await browser.pause(500);
            const backEnd = Date.now();
            tests.push({ test: 'back_response', time: backEnd - backStart });
            
            // Test 3: Activity query responsiveness
            const queryStart = Date.now();
            await browser.getCurrentActivity();
            const queryEnd = Date.now();
            tests.push({ test: 'query_response', time: queryEnd - queryStart });
            
        } catch (error) {
            tests.push({ test: 'error', error: error.message });
        }
        
        return tests;
    }

    /**
     * Get memory information (if available)
     */
    static async getMemoryInfo() {
        try {
            // This might not be available on all devices/configurations
            const memInfo = await browser.execute('mobile: getMemoryInfo');
            return memInfo;
        } catch (error) {
            return { note: 'Memory info not available', error: error.message };
        }
    }

    /**
     * Test navigation speed between screens
     */
    static async testNavigationSpeed() {
        const navigationTests = [];
        
        try {
            // Test forward navigation
            const forwardStart = Date.now();
            await browser.touchAction({
                action: 'tap',
                x: 300,
                y: 400
            });
            await browser.pause(1000);
            const forwardEnd = Date.now();
            navigationTests.push({ direction: 'forward', time: forwardEnd - forwardStart });
            
            // Test back navigation
            const backStart = Date.now();
            await browser.back();
            await browser.pause(1000);
            const backEnd = Date.now();
            navigationTests.push({ direction: 'back', time: backEnd - backStart });
            
        } catch (error) {
            navigationTests.push({ error: error.message });
        }
        
        return navigationTests;
    }

    /**
     * Calculate overall performance score
     */
    static calculateOverallPerformance(responsiveness, navigationSpeed) {
        try {
            const avgResponseTime = responsiveness
                .filter(test => test.time)
                .reduce((sum, test) => sum + test.time, 0) / responsiveness.length;
            
            const avgNavigationTime = navigationSpeed
                .filter(test => test.time)
                .reduce((sum, test) => sum + test.time, 0) / navigationSpeed.length;
            
            // Simple scoring: lower times = better performance
            const responseScore = Math.max(0, 100 - (avgResponseTime / 10));
            const navigationScore = Math.max(0, 100 - (avgNavigationTime / 20));
            
            const overallScore = (responseScore + navigationScore) / 2;
            
            return {
                avgResponseTime,
                avgNavigationTime,
                responseScore: Math.round(responseScore),
                navigationScore: Math.round(navigationScore),
                overallScore: Math.round(overallScore),
                rating: this.getPerformanceRating(overallScore)
            };
            
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Get performance rating based on score
     */
    static getPerformanceRating(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 75) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Poor';
        return 'Very Poor';
    }

    /**
     * Generate test data for data collection scenarios
     */
    static generateTestData() {
        const timestamp = new Date().toISOString();
        
        return {
            specimen: {
                id: `SPEC_${Date.now()}`,
                type: 'Sample Type A',
                collectionTime: timestamp,
                notes: 'Automated test specimen data'
            },
            dome: {
                temperature: Math.round(Math.random() * 30 + 15), // 15-45°C
                humidity: Math.round(Math.random() * 40 + 40), // 40-80%
                pressure: Math.round(Math.random() * 20 + 1000), // 1000-1020 hPa
                timestamp: timestamp
            },
            harvesting: {
                quantity: Math.round(Math.random() * 100 + 50), // 50-150 units
                quality: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                harvestTime: timestamp,
                location: `Zone ${Math.floor(Math.random() * 5) + 1}`
            },
            mediaMoisture: {
                moistureLevel: Math.round(Math.random() * 50 + 30), // 30-80%
                ph: (Math.random() * 2 + 6).toFixed(1), // 6.0-8.0
                conductivity: Math.round(Math.random() * 500 + 200), // 200-700 µS/cm
                timestamp: timestamp
            }
        };
    }

    /**
     * Validate test data against expected formats
     */
    static validateTestData(data, type) {
        const validations = {
            specimen: (d) => d.id && d.type && d.collectionTime,
            dome: (d) => typeof d.temperature === 'number' && typeof d.humidity === 'number',
            harvesting: (d) => typeof d.quantity === 'number' && d.quality && d.location,
            mediaMoisture: (d) => typeof d.moistureLevel === 'number' && d.ph && d.conductivity
        };
        
        const validator = validations[type];
        if (!validator) {
            return { valid: false, error: `Unknown data type: ${type}` };
        }
        
        try {
            const isValid = validator(data);
            return { valid: isValid, data };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Create comprehensive test report
     */
    static createTestReport(testResults) {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                successRate: 0
            },
            details: testResults,
            recommendations: []
        };
        
        // Calculate summary
        if (Array.isArray(testResults)) {
            report.summary.totalTests = testResults.length;
            report.summary.passedTests = testResults.filter(t => t.status === 'passed').length;
            report.summary.failedTests = testResults.filter(t => t.status === 'failed').length;
            report.summary.successRate = (report.summary.passedTests / report.summary.totalTests) * 100;
        }
        
        // Generate recommendations
        if (report.summary.successRate < 80) {
            report.recommendations.push('Consider reviewing failed test cases for app stability issues');
        }
        if (report.summary.successRate > 95) {
            report.recommendations.push('Excellent test results - consider expanding test coverage');
        }
        
        // Save report
        this.saveTestResults('comprehensive_test_report', report);
        
        return report;
    }

    /**
     * Log test step with formatting
     */
    static logTestStep(step, status = 'info', details = '') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const statusIcon = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'start': '🚀',
            'end': '🏁'
        }[status] || 'ℹ️';
        
        console.log(`[${timestamp}] ${statusIcon} ${step}${details ? ` - ${details}` : ''}`);
    }

    /**
     * Wait for app to be in stable state
     */
    static async waitForAppStability(timeout = 5000) {
        const startTime = Date.now();
        let lastActivity = '';
        let stableCount = 0;
        
        while (Date.now() - startTime < timeout) {
            try {
                const currentActivity = await browser.getCurrentActivity();
                
                if (currentActivity === lastActivity) {
                    stableCount++;
                    if (stableCount >= 3) {
                        console.log('📱 App is in stable state');
                        return true;
                    }
                } else {
                    stableCount = 0;
                    lastActivity = currentActivity;
                }
                
                await browser.pause(500);
                
            } catch (error) {
                console.log(`⚠️ Error checking app stability: ${error.message}`);
                break;
            }
        }
        
        console.log('⏰ App stability timeout reached');
        return false;
    }
}

module.exports = ProductionTestHelpers;
