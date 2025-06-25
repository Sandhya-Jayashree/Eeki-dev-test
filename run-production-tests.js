#!/usr/bin/env node

/**
 * Production Data Collection App - Test Runner
 * Comprehensive test execution script for all test suites
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionTestRunner {
    constructor() {
        this.testSuites = [
            {
                name: 'Production Data Main Tests',
                file: 'test/specs/production-data.spec.js',
                description: 'Core functionality tests for the production data collection app'
            },
            {
                name: 'Element Interaction Tests',
                file: 'test/specs/element-interactions.spec.js',
                description: 'Detailed tests for UI element interactions'
            },
            {
                name: 'Data Collection Flow Tests',
                file: 'test/specs/data-collection-flow.spec.js',
                description: 'Business workflow and data collection process tests'
            },
            {
                name: 'Basic App Tests',
                file: 'test/specs/app.basic.test.js',
                description: 'Basic app functionality and stability tests'
            }
        ];
        
        this.results = {
            startTime: new Date().toISOString(),
            testSuites: [],
            summary: {
                totalSuites: 0,
                passedSuites: 0,
                failedSuites: 0,
                totalTests: 0,
                passedTests: 0,
                failedTests: 0
            }
        };
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const dirs = ['screenshots', 'test-results', 'logs'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    /**
     * Check if Appium server is running
     */
    async checkAppiumServer() {
        return new Promise((resolve) => {
            const { spawn } = require('child_process');
            const curl = spawn('curl', ['-s', 'http://localhost:4723/status']);
            
            curl.on('close', (code) => {
                resolve(code === 0);
            });
            
            curl.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Run a single test suite
     */
    async runTestSuite(suite) {
        console.log(`\n🧪 Running: ${suite.name}`);
        console.log(`📄 Description: ${suite.description}`);
        console.log(`📁 File: ${suite.file}`);
        console.log('─'.repeat(60));

        const suiteResult = {
            name: suite.name,
            file: suite.file,
            startTime: new Date().toISOString(),
            status: 'running'
        };

        return new Promise((resolve) => {
            const testProcess = spawn('npx', ['wdio', 'run', 'wdio.conf.js', '--spec', suite.file], {
                stdio: 'inherit',
                cwd: process.cwd()
            });

            testProcess.on('close', (code) => {
                suiteResult.endTime = new Date().toISOString();
                suiteResult.exitCode = code;
                suiteResult.status = code === 0 ? 'passed' : 'failed';
                suiteResult.duration = new Date(suiteResult.endTime) - new Date(suiteResult.startTime);

                if (code === 0) {
                    console.log(`✅ ${suite.name} - PASSED`);
                    this.results.summary.passedSuites++;
                } else {
                    console.log(`❌ ${suite.name} - FAILED (Exit code: ${code})`);
                    this.results.summary.failedSuites++;
                }

                this.results.testSuites.push(suiteResult);
                resolve(suiteResult);
            });

            testProcess.on('error', (error) => {
                suiteResult.endTime = new Date().toISOString();
                suiteResult.status = 'error';
                suiteResult.error = error.message;
                
                console.log(`❌ ${suite.name} - ERROR: ${error.message}`);
                this.results.summary.failedSuites++;
                this.results.testSuites.push(suiteResult);
                resolve(suiteResult);
            });
        });
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('🚀 Production Data Collection App - Test Execution');
        console.log('='.repeat(60));
        console.log(`📅 Started at: ${this.results.startTime}`);
        console.log(`📊 Total test suites: ${this.testSuites.length}\n`);

        // Ensure directories exist
        this.ensureDirectories();

        // Check if Appium server is running
        console.log('🔍 Checking Appium server...');
        const appiumRunning = await this.checkAppiumServer();
        
        if (!appiumRunning) {
            console.log('❌ Appium server is not running!');
            console.log('💡 Please start Appium server: appium');
            console.log('💡 Or run: npm run appium');
            process.exit(1);
        }
        
        console.log('✅ Appium server is running');

        // Check if APK file exists
        const apkPath = './app-dev-release.apk';
        if (!fs.existsSync(apkPath)) {
            console.log(`❌ APK file not found: ${apkPath}`);
            console.log('💡 Please ensure the APK file is in the project root');
            process.exit(1);
        }
        
        console.log('✅ APK file found');

        // Run each test suite
        this.results.summary.totalSuites = this.testSuites.length;
        
        for (const suite of this.testSuites) {
            await this.runTestSuite(suite);
            
            // Add delay between test suites
            if (this.testSuites.indexOf(suite) < this.testSuites.length - 1) {
                console.log('\n⏳ Waiting 5 seconds before next test suite...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Generate final report
        await this.generateFinalReport();
    }

    /**
     * Generate final test report
     */
    async generateFinalReport() {
        this.results.endTime = new Date().toISOString();
        this.results.totalDuration = new Date(this.results.endTime) - new Date(this.results.startTime);

        // Calculate success rate
        const successRate = this.results.summary.totalSuites > 0 ? 
            (this.results.summary.passedSuites / this.results.summary.totalSuites) * 100 : 0;

        console.log('\n📊 FINAL TEST REPORT');
        console.log('='.repeat(60));
        console.log(`⏰ Total Duration: ${Math.round(this.results.totalDuration / 1000)} seconds`);
        console.log(`📦 Test Suites: ${this.results.summary.totalSuites}`);
        console.log(`✅ Passed Suites: ${this.results.summary.passedSuites}`);
        console.log(`❌ Failed Suites: ${this.results.summary.failedSuites}`);
        console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);

        console.log('\n📋 Suite Details:');
        this.results.testSuites.forEach((suite, index) => {
            const duration = suite.duration ? Math.round(suite.duration / 1000) : 0;
            const status = suite.status === 'passed' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${suite.name} (${duration}s)`);
        });

        // Save detailed results
        const reportPath = path.join('./test-results', 'test_execution_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Detailed report saved: ${reportPath}`);

        // Generate HTML report (basic)
        await this.generateHtmlReport();

        console.log('\n📁 Generated Files:');
        console.log('- Screenshots: ./screenshots/');
        console.log('- Test Results: ./test-results/');
        console.log('- HTML Report: ./test-results/test_report.html');

        if (successRate === 100) {
            console.log('\n🎉 ALL TESTS PASSED! Great job!');
        } else if (successRate >= 80) {
            console.log('\n👍 Most tests passed. Review failed tests for improvements.');
        } else {
            console.log('\n⚠️ Several tests failed. Please review and fix issues.');
        }

        console.log('\n🏁 Test execution completed!');
        
        // Exit with appropriate code
        process.exit(this.results.summary.failedSuites > 0 ? 1 : 0);
    }

    /**
     * Generate basic HTML report
     */
    async generateHtmlReport() {
        const successRate = this.results.summary.totalSuites > 0 ? 
            (this.results.summary.passedSuites / this.results.summary.totalSuites) * 100 : 0;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Production Data Collection App - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .suite { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .passed { border-left-color: #4caf50; }
        .failed { border-left-color: #f44336; }
        .success-rate { font-size: 24px; font-weight: bold; color: ${successRate >= 80 ? '#4caf50' : '#f44336'}; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Production Data Collection App - Test Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Duration:</strong> ${Math.round(this.results.totalDuration / 1000)} seconds</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="success-rate">${successRate.toFixed(1)}%</div>
            <div>Success Rate</div>
        </div>
        <div class="metric">
            <div style="font-size: 20px; font-weight: bold;">${this.results.summary.totalSuites}</div>
            <div>Total Suites</div>
        </div>
        <div class="metric">
            <div style="font-size: 20px; font-weight: bold; color: #4caf50;">${this.results.summary.passedSuites}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div style="font-size: 20px; font-weight: bold; color: #f44336;">${this.results.summary.failedSuites}</div>
            <div>Failed</div>
        </div>
    </div>
    
    <h2>📋 Test Suite Results</h2>
    ${this.results.testSuites.map(suite => `
        <div class="suite ${suite.status}">
            <h3>${suite.status === 'passed' ? '✅' : '❌'} ${suite.name}</h3>
            <p><strong>File:</strong> ${suite.file}</p>
            <p><strong>Duration:</strong> ${suite.duration ? Math.round(suite.duration / 1000) : 0} seconds</p>
            <p><strong>Status:</strong> ${suite.status.toUpperCase()}</p>
            ${suite.error ? `<p><strong>Error:</strong> ${suite.error}</p>` : ''}
        </div>
    `).join('')}
    
    <div style="margin-top: 40px; padding: 20px; background: #f9f9f9; border-radius: 5px;">
        <h3>📁 Additional Files</h3>
        <ul>
            <li>Screenshots: ./screenshots/</li>
            <li>Detailed Results: ./test-results/</li>
            <li>Element Discovery: ./test-results/element_discovery.json</li>
        </ul>
    </div>
</body>
</html>`;

        const htmlPath = path.join('./test-results', 'test_report.html');
        fs.writeFileSync(htmlPath, html);
        console.log(`📄 HTML report generated: ${htmlPath}`);
    }
}

// Run tests if called directly
if (require.main === module) {
    const runner = new ProductionTestRunner();
    runner.runAllTests().catch(error => {
        console.error('❌ Test runner error:', error);
        process.exit(1);
    });
}

module.exports = ProductionTestRunner;
