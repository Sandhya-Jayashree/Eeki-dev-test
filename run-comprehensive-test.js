#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs the single comprehensive test and generates HTML report
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestRunner {
    constructor() {
        this.results = {
            startTime: null,
            endTime: null,
            success: false,
            output: '',
            error: '',
            exitCode: null
        };
    }

    /**
     * Check prerequisites
     */
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');

        // Check if APK exists
        const apkPath = './app-dev-release.apk';
        if (!fs.existsSync(apkPath)) {
            throw new Error(`APK file not found: ${apkPath}`);
        }
        console.log('✅ APK file found');

        // Check if Appium server is running
        try {
            const response = await fetch('http://localhost:4723/status');
            if (response.ok) {
                console.log('✅ Appium server is running');
            } else {
                throw new Error('Appium server not responding');
            }
        } catch (error) {
            console.log('❌ Appium server not running');
            console.log('💡 Please start Appium server: appium --relaxed-security');
            throw error;
        }

        // Ensure directories exist
        this.ensureDirectories();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const dirs = ['screenshots', 'test-results', 'allure-results'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    /**
     * Run the comprehensive test
     */
    async runTest() {
        console.log('🚀 Starting comprehensive test...');
        this.results.startTime = new Date().toISOString();

        return new Promise((resolve, reject) => {
            // Run the specific test file
            const testProcess = spawn('npx', [
                'wdio', 
                'run', 
                'wdio.conf.js',
                '--spec',
                './test/specs/single-comprehensive-test.js'
            ], {
                stdio: 'pipe',
                shell: true
            });

            let output = '';
            let errorOutput = '';

            testProcess.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                console.log(text);
            });

            testProcess.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                console.error(text);
            });

            testProcess.on('close', (code) => {
                this.results.endTime = new Date().toISOString();
                this.results.exitCode = code;
                this.results.output = output;
                this.results.error = errorOutput;
                this.results.success = code === 0;

                console.log(`\n🏁 Test completed with exit code: ${code}`);
                
                if (code === 0) {
                    console.log('✅ All tests passed!');
                    resolve();
                } else {
                    console.log('❌ Some tests failed');
                    resolve(); // Don't reject, we still want to generate report
                }
            });

            testProcess.on('error', (error) => {
                this.results.endTime = new Date().toISOString();
                this.results.error = error.message;
                console.error('❌ Test process error:', error.message);
                reject(error);
            });
        });
    }

    /**
     * Generate summary report
     */
    async generateSummaryReport() {
        console.log('📊 Generating summary report...');

        const summary = {
            testRun: {
                startTime: this.results.startTime,
                endTime: this.results.endTime,
                duration: this.results.endTime && this.results.startTime ? 
                    new Date(this.results.endTime) - new Date(this.results.startTime) : 0,
                success: this.results.success,
                exitCode: this.results.exitCode
            },
            files: {
                screenshots: this.getScreenshotFiles(),
                testResults: this.getTestResultFiles(),
                htmlReport: './test-results/comprehensive_test_report.html'
            },
            output: this.results.output,
            error: this.results.error
        };

        // Save summary
        const summaryPath = path.join('./test-results', 'test_run_summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        console.log(`💾 Summary saved: ${summaryPath}`);

        return summary;
    }

    /**
     * Get screenshot files
     */
    getScreenshotFiles() {
        try {
            const screenshotDir = './screenshots';
            if (fs.existsSync(screenshotDir)) {
                return fs.readdirSync(screenshotDir)
                    .filter(file => file.endsWith('.png'))
                    .map(file => path.join(screenshotDir, file));
            }
        } catch (error) {
            console.log('Could not read screenshots directory:', error.message);
        }
        return [];
    }

    /**
     * Get test result files
     */
    getTestResultFiles() {
        try {
            const resultsDir = './test-results';
            if (fs.existsSync(resultsDir)) {
                return fs.readdirSync(resultsDir)
                    .filter(file => file.endsWith('.json') || file.endsWith('.html'))
                    .map(file => path.join(resultsDir, file));
            }
        } catch (error) {
            console.log('Could not read test-results directory:', error.message);
        }
        return [];
    }

    /**
     * Print final summary
     */
    printFinalSummary(summary) {
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMPREHENSIVE TEST SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`🕐 Start Time: ${new Date(summary.testRun.startTime).toLocaleString()}`);
        console.log(`🕐 End Time: ${new Date(summary.testRun.endTime).toLocaleString()}`);
        console.log(`⏱️  Duration: ${this.formatDuration(summary.testRun.duration)}`);
        console.log(`${summary.testRun.success ? '✅' : '❌'} Result: ${summary.testRun.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`🔢 Exit Code: ${summary.testRun.exitCode}`);
        
        console.log('\n📁 Generated Files:');
        console.log(`   📄 HTML Report: ${summary.files.htmlReport}`);
        console.log(`   📊 JSON Summary: ./test-results/test_run_summary.json`);
        console.log(`   📸 Screenshots: ${summary.files.screenshots.length} files in ./screenshots/`);
        console.log(`   📋 Test Results: ${summary.files.testResults.length} files in ./test-results/`);
        
        console.log('\n🎯 Test Scenarios Covered:');
        console.log('   1. ✅ App Launch and Main Screen Verification');
        console.log('   2. ✅ Specimen Button Navigation (Click → Screen Change → Back)');
        console.log('   3. ✅ Dome Button Expansion (Click → Expand → Show Sub-items)');
        console.log('   4. ✅ Harvesting Button Navigation (Expand Dome → Click → Screen Change → Back)');
        console.log('   5. ✅ Media Moisture Button Navigation (Expand Dome → Click → Screen Change → Back)');
        
        console.log('\n' + '='.repeat(60));
        
        if (summary.testRun.success) {
            console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
        } else {
            console.log('⚠️  SOME TESTS FAILED - CHECK THE REPORT FOR DETAILS');
        }
        
        console.log('='.repeat(60));
    }

    /**
     * Format duration in milliseconds
     */
    formatDuration(ms) {
        if (!ms || ms < 0) return '0ms';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Run the complete test suite
     */
    async run() {
        try {
            console.log('🧪 Production Data Collection App - Comprehensive Test Runner');
            console.log('=' .repeat(70));
            
            // Check prerequisites
            await this.checkPrerequisites();
            
            // Run test
            await this.runTest();
            
            // Generate summary
            const summary = await this.generateSummaryReport();
            
            // Print final summary
            this.printFinalSummary(summary);
            
            // Exit with appropriate code
            process.exit(this.results.success ? 0 : 1);
            
        } catch (error) {
            console.error('❌ Test runner failed:', error.message);
            process.exit(1);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const runner = new ComprehensiveTestRunner();
    runner.run();
}

module.exports = ComprehensiveTestRunner;
