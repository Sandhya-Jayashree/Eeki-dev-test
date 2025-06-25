#!/usr/bin/env node

/**
 * Quick Test Script for Production Data Collection App
 * Simple script to run specific test suites or all tests
 */

const { spawn } = require('child_process');
const fs = require('fs');

class QuickTestRunner {
    constructor() {
        this.availableTests = {
            'all': {
                description: 'Run all test suites',
                command: 'node run-production-tests.js'
            },
            'main': {
                description: 'Run main production data tests',
                command: 'npx wdio run wdio.conf.js --spec test/specs/production-data.spec.js'
            },
            'elements': {
                description: 'Run element interaction tests',
                command: 'npx wdio run wdio.conf.js --spec test/specs/element-interactions.spec.js'
            },
            'flows': {
                description: 'Run data collection flow tests',
                command: 'npx wdio run wdio.conf.js --spec test/specs/data-collection-flow.spec.js'
            },
            'basic': {
                description: 'Run basic app functionality tests',
                command: 'npx wdio run wdio.conf.js --spec test/specs/app.basic.test.js'
            },
            'discover': {
                description: 'Run element discovery only',
                command: 'node element-finder.js'
            }
        };
    }

    /**
     * Display help information
     */
    showHelp() {
        console.log('🧪 Production Data Collection App - Quick Test Runner');
        console.log('='.repeat(60));
        console.log('\nUsage: node test-production-app.js [test-type]');
        console.log('\nAvailable test types:');
        
        Object.entries(this.availableTests).forEach(([key, test]) => {
            console.log(`  ${key.padEnd(10)} - ${test.description}`);
        });
        
        console.log('\nExamples:');
        console.log('  node test-production-app.js all      # Run all tests');
        console.log('  node test-production-app.js main     # Run main tests only');
        console.log('  node test-production-app.js elements # Run element tests only');
        console.log('\nPrerequisites:');
        console.log('  ✅ Appium server running (appium)');
        console.log('  ✅ Android device/emulator connected');
        console.log('  ✅ APK file present (app-dev-release.apk)');
    }

    /**
     * Check prerequisites
     */
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...\n');
        
        const checks = [];
        
        // Check APK file
        const apkExists = fs.existsSync('./app-dev-release.apk');
        checks.push({
            name: 'APK file',
            status: apkExists,
            message: apkExists ? 'Found app-dev-release.apk' : 'APK file not found'
        });
        
        // Check Appium server
        const appiumRunning = await this.checkAppiumServer();
        checks.push({
            name: 'Appium server',
            status: appiumRunning,
            message: appiumRunning ? 'Appium server is running' : 'Appium server not running'
        });
        
        // Check test files
        const testFiles = [
            'test/specs/production-data.spec.js',
            'test/specs/element-interactions.spec.js',
            'test/specs/data-collection-flow.spec.js'
        ];
        
        const testFilesExist = testFiles.every(file => fs.existsSync(file));
        checks.push({
            name: 'Test files',
            status: testFilesExist,
            message: testFilesExist ? 'All test files found' : 'Some test files missing'
        });
        
        // Display results
        checks.forEach(check => {
            const status = check.status ? '✅' : '❌';
            console.log(`${status} ${check.name}: ${check.message}`);
        });
        
        const allPassed = checks.every(check => check.status);
        
        if (!allPassed) {
            console.log('\n❌ Prerequisites not met. Please fix the issues above.');
            console.log('\n💡 Quick fixes:');
            if (!checks[0].status) {
                console.log('  - Ensure app-dev-release.apk is in the project root');
            }
            if (!checks[1].status) {
                console.log('  - Start Appium server: appium');
                console.log('  - Or run: npm run appium');
            }
            if (!checks[2].status) {
                console.log('  - Run: node generate-tests.js to create test files');
            }
            return false;
        }
        
        console.log('\n✅ All prerequisites met!');
        return true;
    }

    /**
     * Check if Appium server is running
     */
    async checkAppiumServer() {
        return new Promise((resolve) => {
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
     * Run specific test
     */
    async runTest(testType) {
        const test = this.availableTests[testType];
        
        if (!test) {
            console.log(`❌ Unknown test type: ${testType}`);
            this.showHelp();
            return;
        }
        
        console.log(`\n🚀 Running: ${test.description}`);
        console.log(`📝 Command: ${test.command}`);
        console.log('─'.repeat(60));
        
        const [command, ...args] = test.command.split(' ');
        
        const testProcess = spawn(command, args, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        testProcess.on('close', (code) => {
            console.log(`\n🏁 Test completed with exit code: ${code}`);
            
            if (code === 0) {
                console.log('✅ Tests passed successfully!');
                console.log('\n📁 Check these folders for results:');
                console.log('  - Screenshots: ./screenshots/');
                console.log('  - Test Results: ./test-results/');
            } else {
                console.log('❌ Some tests failed. Check the output above for details.');
            }
        });
        
        testProcess.on('error', (error) => {
            console.log(`❌ Error running tests: ${error.message}`);
        });
    }

    /**
     * Interactive test selection
     */
    async interactiveMode() {
        console.log('🎯 Interactive Test Selection');
        console.log('─'.repeat(30));
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        console.log('\nAvailable tests:');
        Object.entries(this.availableTests).forEach(([key, test], index) => {
            console.log(`  ${index + 1}. ${key} - ${test.description}`);
        });
        
        rl.question('\nSelect test number (or type test name): ', (answer) => {
            rl.close();
            
            // Check if it's a number
            const testNumber = parseInt(answer);
            if (!isNaN(testNumber)) {
                const testKeys = Object.keys(this.availableTests);
                if (testNumber >= 1 && testNumber <= testKeys.length) {
                    this.runTest(testKeys[testNumber - 1]);
                    return;
                }
            }
            
            // Check if it's a test name
            if (this.availableTests[answer]) {
                this.runTest(answer);
            } else {
                console.log(`❌ Invalid selection: ${answer}`);
                this.showHelp();
            }
        });
    }

    /**
     * Main execution method
     */
    async run() {
        const args = process.argv.slice(2);
        
        // Show help if no arguments or help requested
        if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
            this.showHelp();
            return;
        }
        
        // Interactive mode
        if (args[0] === 'interactive' || args[0] === '-i') {
            const prereqsPassed = await this.checkPrerequisites();
            if (prereqsPassed) {
                await this.interactiveMode();
            }
            return;
        }
        
        // Check prerequisites
        const prereqsPassed = await this.checkPrerequisites();
        if (!prereqsPassed) {
            return;
        }
        
        // Run specific test
        const testType = args[0];
        await this.runTest(testType);
    }
}

// Run if called directly
if (require.main === module) {
    const runner = new QuickTestRunner();
    runner.run().catch(error => {
        console.error('❌ Runner error:', error);
        process.exit(1);
    });
}

module.exports = QuickTestRunner;
