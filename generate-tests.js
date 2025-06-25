#!/usr/bin/env node

/**
 * Test Case Generator
 * Generates actual test files based on discovered UI elements
 */

const fs = require('fs');
const path = require('path');

class TestGenerator {
    constructor() {
        this.inspectionData = null;
        this.testDir = './test/specs';
        this.pageObjectDir = './test/pageobjects';
    }

    loadInspectionData() {
        try {
            const deepInspectionPath = './test-results/deep_inspection.json';
            const basicInspectionPath = './test-results/app_inspection.json';
            
            if (fs.existsSync(deepInspectionPath)) {
                console.log('📖 Loading deep inspection data...');
                this.inspectionData = JSON.parse(fs.readFileSync(deepInspectionPath, 'utf8'));
                return true;
            } else if (fs.existsSync(basicInspectionPath)) {
                console.log('📖 Loading basic inspection data...');
                const basicData = JSON.parse(fs.readFileSync(basicInspectionPath, 'utf8'));
                // Convert basic data to expected format
                this.inspectionData = this.convertBasicData(basicData);
                return true;
            } else {
                console.log('❌ No inspection data found. Please run inspection first.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error loading inspection data:', error.message);
            return false;
        }
    }

    convertBasicData(basicData) {
        return {
            appInfo: basicData.appInfo,
            discoveredScreens: [{
                screenInfo: {
                    activity: basicData.appInfo.activity,
                    package: basicData.appInfo.package,
                    timestamp: basicData.timestamp
                },
                elements: {
                    clickable: basicData.elements.textElements.map((text, index) => ({
                        index,
                        text,
                        selector: [`android=new UiSelector().text("${text}")`, `//*[@text="${text}"]`]
                    })),
                    inputs: [],
                    texts: basicData.elements.textElements.map((text, index) => ({
                        index,
                        text
                    })),
                    scrollable: []
                }
            }],
            generatedTestCases: []
        };
    }

    ensureDirectories() {
        const dirs = [this.testDir, this.pageObjectDir, './test/helpers'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    generatePageObject() {
        const mainScreen = this.inspectionData.discoveredScreens[0];
        const appName = this.inspectionData.appInfo.package.split('.').pop();
        
        const pageObjectContent = `/**
 * ${appName} App Page Object
 * Generated automatically from UI inspection
 */

class ${appName.charAt(0).toUpperCase() + appName.slice(1)}Page {
    
    // Text Elements
${mainScreen.elements.texts.map(element => 
    `    get ${this.camelCase(element.text)}Text() { 
        return $('//android.widget.TextView[@text="${element.text}"]'); 
    }`
).join('\n')}

    // Clickable Elements  
${mainScreen.elements.clickable.map(element => 
    element.text ? `    get ${this.camelCase(element.text)}Button() { 
        return $('${element.selector ? element.selector[1] || element.selector[0] : `//*[@text="${element.text}"]`}'); 
    }` : ''
).filter(Boolean).join('\n')}

    // Input Elements
${mainScreen.elements.inputs.map((element, index) => 
    `    get ${element.hint ? this.camelCase(element.hint) : `input${index + 1}`}Field() { 
        return $('${element.selector ? element.selector[1] || element.selector[0] : `(//android.widget.EditText)[${index + 1}]`}'); 
    }`
).join('\n')}

    // Actions
    async waitForPageLoad() {
        await this.${this.camelCase(mainScreen.elements.texts[0]?.text || 'main')}Text.waitForDisplayed({ timeout: 10000 });
    }

    async takeScreenshot(name) {
        await browser.saveScreenshot(\`./screenshots/\${name}_\${new Date().toISOString().replace(/[:.]/g, '-')}.png\`);
    }

${mainScreen.elements.clickable.map(element => 
    element.text ? `    async click${this.pascalCase(element.text)}() {
        await this.${this.camelCase(element.text)}Button.waitForDisplayed();
        await this.${this.camelCase(element.text)}Button.click();
        await browser.pause(2000); // Wait for navigation
    }` : ''
).filter(Boolean).join('\n\n')}

${mainScreen.elements.inputs.map((element, index) => 
    `    async enterText${element.hint ? this.pascalCase(element.hint) : `Input${index + 1}`}(text) {
        await this.${element.hint ? this.camelCase(element.hint) : `input${index + 1}`}Field.waitForDisplayed();
        await this.${element.hint ? this.camelCase(element.hint) : `input${index + 1}`}Field.setValue(text);
    }`
).join('\n\n')}
}

module.exports = new ${appName.charAt(0).toUpperCase() + appName.slice(1)}Page();
`;

        const fileName = `${appName.charAt(0).toUpperCase() + appName.slice(1)}Page.js`;
        fs.writeFileSync(path.join(this.pageObjectDir, fileName), pageObjectContent);
        console.log(`✅ Generated page object: ${fileName}`);
        
        return fileName;
    }

    generateBasicTests() {
        const mainScreen = this.inspectionData.discoveredScreens[0];
        const appName = this.inspectionData.appInfo.package.split('.').pop();
        const pageObjectName = `${appName.charAt(0).toUpperCase() + appName.slice(1)}Page`;
        
        const testContent = `/**
 * ${appName} App Basic Tests
 * Generated automatically from UI inspection
 */

const ${pageObjectName} = require('../pageobjects/${pageObjectName}');

describe('${appName} App Basic Tests', () => {
    
    beforeEach(async () => {
        // App should already be launched by WebDriverIO
        await ${pageObjectName}.waitForPageLoad();
    });

    afterEach(async () => {
        // Take screenshot after each test
        await ${pageObjectName}.takeScreenshot(\`test_\${expect.getState().currentTestName?.replace(/\\s+/g, '_')}\`);
    });

    it('should load the main screen successfully', async () => {
        // Verify main screen elements are displayed
${mainScreen.elements.texts.slice(0, 3).map(element => 
    `        await expect(${pageObjectName}.${this.camelCase(element.text)}Text).toBeDisplayed();`
).join('\n')}
        
        console.log('✅ Main screen loaded successfully');
    });

${mainScreen.elements.clickable.filter(el => el.text).slice(0, 3).map(element => `
    it('should be able to click ${element.text}', async () => {
        // Verify element is clickable
        await expect(${pageObjectName}.${this.camelCase(element.text)}Button).toBeDisplayed();
        await expect(${pageObjectName}.${this.camelCase(element.text)}Button).toBeClickable();
        
        // Click the element
        await ${pageObjectName}.click${this.pascalCase(element.text)}();
        
        // Add your verification logic here
        // For example: verify navigation, popup, or state change
        
        console.log('✅ Successfully clicked ${element.text}');
    });`).join('')}

${mainScreen.elements.inputs.slice(0, 2).map((element, index) => `
    it('should be able to enter text in ${element.hint || `input field ${index + 1}`}', async () => {
        const testText = 'Test Input ${Date.now()}';
        
        // Enter text in input field
        await ${pageObjectName}.enterText${element.hint ? this.pascalCase(element.hint) : `Input${index + 1}`}(testText);
        
        // Verify text was entered
        const enteredText = await ${pageObjectName}.${element.hint ? this.camelCase(element.hint) : `input${index + 1}`}Field.getValue();
        await expect(enteredText).toBe(testText);
        
        console.log('✅ Successfully entered text in ${element.hint || `input field ${index + 1}`}');
    });`).join('')}

    it('should handle basic app interactions', async () => {
        // Test basic gestures and interactions
        const { width, height } = await browser.getWindowSize();
        
        // Test scroll if scrollable elements exist
${mainScreen.elements.scrollable.length > 0 ? `        
        // Perform scroll gesture
        await browser.touchAction([
            { action: 'press', x: width / 2, y: height * 0.7 },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: width / 2, y: height * 0.3 },
            { action: 'release' }
        ]);
        await browser.pause(1000);` : ''}
        
        // Test tap gesture
        await browser.touchAction({
            action: 'tap',
            x: width / 2,
            y: height / 3
        });
        await browser.pause(1000);
        
        console.log('✅ Basic interactions completed');
    });
});
`;

        const fileName = `${appName}.basic.spec.js`;
        fs.writeFileSync(path.join(this.testDir, fileName), testContent);
        console.log(`✅ Generated basic tests: ${fileName}`);
        
        return fileName;
    }

    camelCase(str) {
        if (!str) return 'element';
        return str.replace(/[^a-zA-Z0-9]/g, ' ')
                 .split(' ')
                 .map((word, index) => 
                     index === 0 ? word.toLowerCase() : 
                     word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                 )
                 .join('')
                 .replace(/^\d/, 'element$&'); // Handle strings starting with numbers
    }

    pascalCase(str) {
        if (!str) return 'Element';
        return str.replace(/[^a-zA-Z0-9]/g, ' ')
                 .split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                 .join('')
                 .replace(/^\d/, 'Element$&'); // Handle strings starting with numbers
    }

    generateHelpers() {
        const helpersContent = `/**
 * Test Helpers
 * Common utilities for testing
 */

class TestHelpers {
    static async waitForElement(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
    }

    static async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await browser.saveScreenshot(\`./screenshots/\${name}_\${timestamp}.png\`);
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
            text: \`Test_\${Date.now()}\`,
            email: \`test\${Date.now()}@example.com\`,
            number: Math.floor(Math.random() * 1000).toString(),
            date: new Date().toISOString().split('T')[0]
        };
    }
}

module.exports = TestHelpers;
`;

        fs.writeFileSync(path.join('./test/helpers', 'TestHelpers.js'), helpersContent);
        console.log('✅ Generated test helpers');
    }

    async generate() {
        console.log('🚀 Starting Test Generation');
        console.log('===========================\n');

        if (!this.loadInspectionData()) {
            return false;
        }

        this.ensureDirectories();
        
        console.log('\n📝 Generating test files...');
        
        // Generate page objects
        const pageObjectFile = this.generatePageObject();
        
        // Generate basic tests
        const testFile = this.generateBasicTests();
        
        // Generate helpers
        this.generateHelpers();
        
        console.log('\n✅ Test generation completed!');
        console.log('\n📁 Generated Files:');
        console.log(`- Page Object: ./test/pageobjects/${pageObjectFile}`);
        console.log(`- Test Spec: ./test/specs/${testFile}`);
        console.log('- Test Helpers: ./test/helpers/TestHelpers.js');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Review and customize the generated tests');
        console.log('2. Add your specific business logic validations');
        console.log('3. Run tests: npm test');
        console.log('4. Update selectors if elements are not found');
        
        return true;
    }
}

// Run if called directly
if (require.main === module) {
    const generator = new TestGenerator();
    generator.generate().catch(console.error);
}

module.exports = TestGenerator;
