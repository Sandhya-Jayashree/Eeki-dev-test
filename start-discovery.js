#!/usr/bin/env node

/**
 * Start Discovery - Interactive Helper Script
 * Helps you choose the right discovery approach for your APK
 */

const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class DiscoveryStarter {
    constructor() {
        this.apkPath = 'app-dev-release.apk';
    }

    async start() {
        console.log('🚀 APK Automation Discovery Helper');
        console.log('==================================\n');

        // Check prerequisites
        if (!await this.checkPrerequisites()) {
            return;
        }

        // Show options
        await this.showOptions();
    }

    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...\n');

        // Check if APK exists
        if (!fs.existsSync(this.apkPath)) {
            console.log('❌ APK file not found: app-dev-release.apk');
            console.log('   Please place your APK file in the project root and name it "app-dev-release.apk"');
            console.log('   Or update the path in the scripts\n');
            return false;
        }
        console.log('✅ APK file found');

        // Check if required directories exist
        const dirs = ['screenshots', 'test-results', 'test/specs', 'test/pageobjects'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });

        console.log('✅ Directories ready');
        console.log('✅ Prerequisites check passed\n');
        return true;
    }

    async showOptions() {
        console.log('📋 Choose your discovery approach:\n');
        console.log('1. 🔍 Quick Element Discovery (Recommended for first time)');
        console.log('   - Finds buttons, inputs, text elements');
        console.log('   - Fast and focused');
        console.log('   - Good for understanding app structure\n');
        
        console.log('2. 🎯 Deep App Exploration');
        console.log('   - Navigates through app screens');
        console.log('   - Discovers elements on multiple screens');
        console.log('   - More comprehensive but takes longer\n');
        
        console.log('3. 🚀 Complete Workflow');
        console.log('   - Runs all discovery methods');
        console.log('   - Generates comprehensive test suite');
        console.log('   - Creates detailed reports\n');
        
        console.log('4. 📊 View Previous Results');
        console.log('   - Show results from previous discoveries');
        console.log('   - Generate tests from existing data\n');

        const choice = await this.askQuestion('Enter your choice (1-4): ');
        await this.handleChoice(choice.trim());
    }

    async handleChoice(choice) {
        switch (choice) {
            case '1':
                await this.runQuickDiscovery();
                break;
            case '2':
                await this.runDeepExploration();
                break;
            case '3':
                await this.runCompleteWorkflow();
                break;
            case '4':
                await this.viewPreviousResults();
                break;
            default:
                console.log('❌ Invalid choice. Please run the script again.');
                break;
        }
        rl.close();
    }

    async runQuickDiscovery() {
        console.log('\n🔍 Starting Quick Element Discovery...');
        console.log('=====================================\n');
        
        console.log('📋 This will:');
        console.log('- Connect to your app');
        console.log('- Find all buttons, inputs, and text elements');
        console.log('- Generate basic test cases');
        console.log('- Take screenshots for reference\n');

        const confirm = await this.askQuestion('Continue? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
            console.log('\n🚀 Starting discovery...\n');
            console.log('⚠️  Make sure:');
            console.log('- Appium server is running (appium)');
            console.log('- Android emulator/device is connected');
            console.log('- Your app APK is ready\n');
            
            await this.runScript('node element-finder.js');
            
            console.log('\n✅ Quick discovery completed!');
            console.log('\n🎯 Next steps:');
            console.log('1. Review: test-results/element_discovery.json');
            console.log('2. Generate tests: node generate-tests.js');
            console.log('3. Run tests: npm test');
        }
    }

    async runDeepExploration() {
        console.log('\n🎯 Starting Deep App Exploration...');
        console.log('===================================\n');
        
        console.log('📋 This will:');
        console.log('- Navigate through your app screens');
        console.log('- Click on major UI elements');
        console.log('- Discover elements on each screen');
        console.log('- Map app navigation flow\n');

        const confirm = await this.askQuestion('Continue? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
            console.log('\n🚀 Starting deep exploration...\n');
            await this.runScript('node deep-inspect.js');
            
            console.log('\n✅ Deep exploration completed!');
            console.log('\n🎯 Next steps:');
            console.log('1. Review: test-results/deep_inspection.json');
            console.log('2. Generate tests: node generate-tests.js');
        }
    }

    async runCompleteWorkflow() {
        console.log('\n🚀 Starting Complete Discovery Workflow...');
        console.log('==========================================\n');
        
        console.log('📋 This will run the complete workflow:');
        console.log('- Quick element discovery');
        console.log('- Deep app exploration');
        console.log('- Test case generation');
        console.log('- Comprehensive reporting\n');
        
        console.log('⏱️  Estimated time: 5-10 minutes');

        const confirm = await this.askQuestion('Continue? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
            console.log('\n🚀 Starting complete workflow...\n');
            await this.runScript('node discover-and-test.js');
            
            console.log('\n✅ Complete workflow finished!');
            console.log('\n📖 Read the report: cat test-results/DISCOVERY_REPORT.md');
        }
    }

    async viewPreviousResults() {
        console.log('\n📊 Previous Discovery Results');
        console.log('=============================\n');

        const resultFiles = [
            { file: 'test-results/app_inspection.json', name: 'Basic App Inspection' },
            { file: 'test-results/element_discovery.json', name: 'Element Discovery' },
            { file: 'test-results/deep_inspection.json', name: 'Deep Inspection' },
            { file: 'test-results/complete_discovery_summary.json', name: 'Complete Summary' }
        ];

        let foundResults = false;
        resultFiles.forEach(({ file, name }) => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                console.log(`✅ ${name}`);
                console.log(`   File: ${file}`);
                console.log(`   Modified: ${stats.mtime.toLocaleString()}\n`);
                foundResults = true;
            }
        });

        if (!foundResults) {
            console.log('❌ No previous results found.');
            console.log('   Run a discovery first to generate results.\n');
        } else {
            console.log('🎯 You can:');
            console.log('1. Generate tests from existing data: node generate-tests.js');
            console.log('2. View detailed report: cat test-results/DISCOVERY_REPORT.md');
            console.log('3. Run existing tests: npm test\n');
        }
    }

    async runScript(command) {
        return new Promise((resolve, reject) => {
            console.log(`🔄 Running: ${command}\n`);
            
            const child = spawn(command, { shell: true, stdio: 'inherit' });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    console.log(`\n❌ Command failed with code ${code}`);
                    reject(new Error(`Command failed: ${command}`));
                }
            });

            child.on('error', (error) => {
                console.log(`\n❌ Error running command: ${error.message}`);
                reject(error);
            });
        });
    }

    askQuestion(question) {
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }
}

// Run if called directly
if (require.main === module) {
    const starter = new DiscoveryStarter();
    starter.start().catch(console.error);
}

module.exports = DiscoveryStarter;
