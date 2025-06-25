#!/usr/bin/env node

/**
 * Complete Discovery and Test Generation Workflow
 * This script runs the complete workflow to discover UI elements and generate tests
 */

const { runElementFinder } = require('./element-finder');
const { runDeepInspection } = require('./deep-inspect');
const TestGenerator = require('./generate-tests');
const fs = require('fs');

class DiscoveryWorkflow {
    constructor() {
        this.results = {
            basicInspection: null,
            elementDiscovery: null,
            deepInspection: null,
            testGeneration: null
        };
    }

    async runCompleteWorkflow() {
        console.log('🚀 Starting Complete APK Discovery and Test Generation Workflow');
        console.log('================================================================\n');

        try {
            // Step 1: Basic App Inspection (if not already done)
            console.log('📋 Step 1: Basic App Inspection');
            console.log('================================');
            await this.runBasicInspection();

            // Step 2: Enhanced Element Discovery
            console.log('\n🔍 Step 2: Enhanced Element Discovery');
            console.log('====================================');
            this.results.elementDiscovery = await runElementFinder();

            // Step 3: Deep Screen Navigation and Discovery
            console.log('\n🎯 Step 3: Deep Screen Navigation Discovery');
            console.log('==========================================');
            this.results.deepInspection = await runDeepInspection();

            // Step 4: Generate Test Cases
            console.log('\n🧪 Step 4: Test Case Generation');
            console.log('===============================');
            await this.generateTests();

            // Step 5: Create Summary Report
            console.log('\n📊 Step 5: Creating Summary Report');
            console.log('==================================');
            await this.createSummaryReport();

            console.log('\n🎉 Complete workflow finished successfully!');
            this.printFinalSummary();

        } catch (error) {
            console.error('❌ Workflow failed:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('- Make sure Appium server is running: appium');
            console.log('- Check if device/emulator is connected: adb devices');
            console.log('- Verify APK path is correct');
            console.log('- Ensure device has enough free space');
        }
    }

    async runBasicInspection() {
        const basicInspectionPath = './test-results/app_inspection.json';
        
        if (fs.existsSync(basicInspectionPath)) {
            console.log('✅ Basic inspection already completed');
            this.results.basicInspection = JSON.parse(fs.readFileSync(basicInspectionPath, 'utf8'));
        } else {
            console.log('⚠️  Basic inspection not found. Please run: node inspect-app.js first');
            console.log('   Continuing with available data...');
        }
    }

    async generateTests() {
        try {
            const generator = new TestGenerator();
            this.results.testGeneration = await generator.generate();
            console.log('✅ Test generation completed');
        } catch (error) {
            console.log('❌ Test generation failed:', error.message);
            this.results.testGeneration = false;
        }
    }

    async createSummaryReport() {
        const summary = {
            timestamp: new Date().toISOString(),
            workflowResults: this.results,
            discoveredElements: this.consolidateElements(),
            recommendations: this.generateRecommendations(),
            testStrategy: this.generateTestStrategy()
        };

        // Ensure directory exists
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }

        fs.writeFileSync(
            './test-results/complete_discovery_summary.json',
            JSON.stringify(summary, null, 2)
        );

        // Create human-readable report
        const readableReport = this.createReadableReport(summary);
        fs.writeFileSync('./test-results/DISCOVERY_REPORT.md', readableReport);

        console.log('✅ Summary report created');
    }

    consolidateElements() {
        const consolidated = {
            totalElements: 0,
            elementTypes: {},
            keyElements: [],
            testableElements: []
        };

        // Consolidate from element discovery
        if (this.results.elementDiscovery) {
            const elements = this.results.elementDiscovery.elements;
            
            consolidated.elementTypes = {
                buttons: elements.buttons?.length || 0,
                inputs: elements.inputs?.length || 0,
                texts: elements.texts?.length || 0,
                images: elements.images?.length || 0,
                lists: elements.lists?.length || 0,
                checkboxes: elements.checkboxes?.length || 0,
                custom: elements.custom?.length || 0
            };

            consolidated.totalElements = Object.values(consolidated.elementTypes)
                .reduce((sum, count) => sum + count, 0);

            // Identify key testable elements
            if (elements.buttons) {
                consolidated.testableElements.push(...elements.buttons.map(btn => ({
                    type: 'button',
                    text: btn.text || btn.contentDesc,
                    selectors: btn.selectors,
                    testable: true
                })));
            }

            if (elements.inputs) {
                consolidated.testableElements.push(...elements.inputs.map(input => ({
                    type: 'input',
                    hint: input.text,
                    inputType: input.inputType,
                    selectors: input.selectors,
                    testable: true
                })));
            }
        }

        return consolidated;
    }

    generateRecommendations() {
        const recommendations = [];
        const elements = this.consolidateElements();

        // Button testing recommendations
        if (elements.elementTypes.buttons > 0) {
            recommendations.push({
                category: 'Button Testing',
                priority: 'High',
                description: `Found ${elements.elementTypes.buttons} buttons. Test click functionality, navigation, and state changes.`,
                actions: [
                    'Verify all buttons are clickable',
                    'Test button navigation flows',
                    'Validate button state changes',
                    'Check button accessibility'
                ]
            });
        }

        // Input field testing recommendations
        if (elements.elementTypes.inputs > 0) {
            recommendations.push({
                category: 'Input Field Testing',
                priority: 'High',
                description: `Found ${elements.elementTypes.inputs} input fields. Test data entry, validation, and edge cases.`,
                actions: [
                    'Test valid data entry',
                    'Test invalid data handling',
                    'Verify input field constraints',
                    'Test special characters and edge cases'
                ]
            });
        }

        // UI/UX testing recommendations
        if (elements.elementTypes.texts > 5) {
            recommendations.push({
                category: 'UI/UX Testing',
                priority: 'Medium',
                description: 'Rich text content detected. Test text display, localization, and accessibility.',
                actions: [
                    'Verify text content accuracy',
                    'Test text scaling and accessibility',
                    'Validate text localization if applicable',
                    'Check text overflow handling'
                ]
            });
        }

        // Performance testing recommendations
        if (elements.elementTypes.lists > 0 || elements.elementTypes.images > 3) {
            recommendations.push({
                category: 'Performance Testing',
                priority: 'Medium',
                description: 'Lists or multiple images detected. Consider performance testing.',
                actions: [
                    'Test scrolling performance',
                    'Verify image loading times',
                    'Test memory usage during navigation',
                    'Check app responsiveness'
                ]
            });
        }

        return recommendations;
    }

    generateTestStrategy() {
        const elements = this.consolidateElements();
        
        return {
            testTypes: {
                functional: {
                    priority: 'High',
                    coverage: elements.elementTypes.buttons + elements.elementTypes.inputs,
                    description: 'Test core app functionality through buttons and inputs'
                },
                ui: {
                    priority: 'Medium',
                    coverage: elements.elementTypes.texts + elements.elementTypes.images,
                    description: 'Test UI elements display and layout'
                },
                navigation: {
                    priority: 'High',
                    coverage: elements.elementTypes.buttons,
                    description: 'Test app navigation and screen transitions'
                },
                dataEntry: {
                    priority: elements.elementTypes.inputs > 0 ? 'High' : 'Low',
                    coverage: elements.elementTypes.inputs,
                    description: 'Test data entry, validation, and persistence'
                }
            },
            estimatedTestCases: Math.max(10, elements.totalElements * 0.3),
            recommendedTestDuration: '2-4 hours for comprehensive testing'
        };
    }

    createReadableReport(summary) {
        const elements = summary.discoveredElements;
        
        return `# APK Automation Discovery Report

Generated on: ${new Date(summary.timestamp).toLocaleString()}

## 📊 Discovery Summary

### Elements Found
- **Total Elements**: ${elements.totalElements}
- **Buttons**: ${elements.elementTypes.buttons}
- **Input Fields**: ${elements.elementTypes.inputs}
- **Text Elements**: ${elements.elementTypes.texts}
- **Images**: ${elements.elementTypes.images}
- **Lists**: ${elements.elementTypes.lists}
- **Checkboxes**: ${elements.elementTypes.checkboxes}
- **Custom Elements**: ${elements.elementTypes.custom}

### Testable Elements
- **Interactive Elements**: ${elements.testableElements.length}
- **Test Cases Generated**: ${summary.testStrategy.estimatedTestCases}

## 🎯 Test Strategy

${Object.entries(summary.testStrategy.testTypes).map(([type, info]) => 
`### ${type.charAt(0).toUpperCase() + type.slice(1)} Testing
- **Priority**: ${info.priority}
- **Coverage**: ${info.coverage} elements
- **Description**: ${info.description}
`).join('\n')}

## 💡 Recommendations

${summary.recommendations.map((rec, index) => 
`### ${index + 1}. ${rec.category} (${rec.priority} Priority)
${rec.description}

**Actions:**
${rec.actions.map(action => `- ${action}`).join('\n')}
`).join('\n')}

## 📁 Generated Files

- \`test-results/element_discovery.json\` - Detailed element information
- \`test-results/deep_inspection.json\` - Screen navigation data
- \`test/pageobjects/\` - Page object models
- \`test/specs/\` - Generated test cases
- \`screenshots/\` - App screenshots

## 🚀 Next Steps

1. **Review Generated Tests**: Check the test files in \`test/specs/\`
2. **Customize Tests**: Add your specific business logic validations
3. **Run Tests**: Execute \`npm test\` to run the test suite
4. **Iterate**: Update selectors and tests based on results

## 🔧 Troubleshooting

If tests fail:
1. Check element selectors in page objects
2. Verify app state and navigation
3. Update wait times if needed
4. Review screenshots for UI changes

---
*Report generated by APK Automation Discovery Tool*
`;
    }

    printFinalSummary() {
        console.log('\n📋 FINAL SUMMARY');
        console.log('================');
        
        const elements = this.consolidateElements();
        console.log(`📊 Total Elements Discovered: ${elements.totalElements}`);
        console.log(`🔘 Buttons: ${elements.elementTypes.buttons}`);
        console.log(`📝 Input Fields: ${elements.elementTypes.inputs}`);
        console.log(`📄 Text Elements: ${elements.elementTypes.texts}`);
        
        console.log('\n📁 Generated Files:');
        console.log('- ./test-results/complete_discovery_summary.json');
        console.log('- ./test-results/DISCOVERY_REPORT.md');
        console.log('- ./test/pageobjects/ (Page Objects)');
        console.log('- ./test/specs/ (Test Cases)');
        console.log('- ./screenshots/ (App Screenshots)');
        
        console.log('\n🎯 Ready to Test!');
        console.log('Run: npm test');
        console.log('Or: npx wdio wdio.conf.js');
        
        console.log('\n📖 Read the detailed report:');
        console.log('cat ./test-results/DISCOVERY_REPORT.md');
    }
}

// Run if called directly
if (require.main === module) {
    const workflow = new DiscoveryWorkflow();
    workflow.runCompleteWorkflow().catch(console.error);
}

module.exports = DiscoveryWorkflow;
