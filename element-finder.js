#!/usr/bin/env node

/**
 * Enhanced Element Finder
 * Specialized script to find and categorize different types of UI elements
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

class ElementFinder {
    constructor(driver) {
        this.driver = driver;
        this.foundElements = {
            buttons: [],
            inputs: [],
            texts: [],
            images: [],
            lists: [],
            checkboxes: [],
            radioButtons: [],
            switches: [],
            sliders: [],
            tabs: [],
            menus: [],
            custom: []
        };
    }

    async findAllElementTypes() {
        console.log('🔍 Starting comprehensive element discovery...\n');

        await this.findButtons();
        await this.findInputFields();
        await this.findTextElements();
        await this.findImageElements();
        await this.findListElements();
        await this.findCheckboxes();
        await this.findCustomElements();

        return this.foundElements;
    }

    async findButtons() {
        console.log('🔘 Finding buttons...');
        
        const selectors = [
            '//android.widget.Button',
            '//*[@clickable="true" and @text]',
            '//*[contains(@resource-id, "button")]',
            '//*[contains(@resource-id, "btn")]'
        ];

        for (const selector of selectors) {
            try {
                const elements = await this.driver.$$(selector);
                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        const info = await this.getElementInfo(element);
                        if (!this.isDuplicate(this.foundElements.buttons, info)) {
                            this.foundElements.buttons.push(info);
                        }
                    }
                }
            } catch (error) {
                // Continue with next selector
            }
        }
        
        console.log(`   Found ${this.foundElements.buttons.length} buttons`);
    }

    async findInputFields() {
        console.log('📝 Finding input fields...');
        
        const selectors = [
            '//android.widget.EditText',
            '//*[contains(@resource-id, "edit")]',
            '//*[contains(@resource-id, "input")]'
        ];

        for (const selector of selectors) {
            try {
                const elements = await this.driver.$$(selector);
                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        const info = await this.getElementInfo(element);
                        info.inputType = await element.getAttribute('android:inputType').catch(() => 'text');
                        if (!this.isDuplicate(this.foundElements.inputs, info)) {
                            this.foundElements.inputs.push(info);
                        }
                    }
                }
            } catch (error) {
                // Continue with next selector
            }
        }
        
        console.log(`   Found ${this.foundElements.inputs.length} input fields`);
    }

    async findTextElements() {
        console.log('📄 Finding text elements...');
        
        const elements = await this.driver.$$('//android.widget.TextView');
        let count = 0;
        
        for (const element of elements.slice(0, 20)) {
            try {
                if (await element.isDisplayed()) {
                    const info = await this.getElementInfo(element);
                    if (info.text && info.text.trim() && info.text.length > 0) {
                        if (!this.isDuplicate(this.foundElements.texts, info)) {
                            this.foundElements.texts.push(info);
                            count++;
                        }
                    }
                }
            } catch (error) {
                // Continue with next element
            }
        }
        
        console.log(`   Found ${count} text elements`);
    }

    async findImageElements() {
        console.log('🖼️ Finding image elements...');
        
        const selectors = [
            '//android.widget.ImageView',
            '//android.widget.ImageButton'
        ];

        for (const selector of selectors) {
            try {
                const elements = await this.driver.$$(selector);
                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        const info = await this.getElementInfo(element);
                        if (!this.isDuplicate(this.foundElements.images, info)) {
                            this.foundElements.images.push(info);
                        }
                    }
                }
            } catch (error) {
                // Continue with next selector
            }
        }
        
        console.log(`   Found ${this.foundElements.images.length} image elements`);
    }

    async findListElements() {
        console.log('📋 Finding list elements...');
        
        const selectors = [
            '//android.widget.ListView',
            '//android.widget.RecyclerView',
            '//androidx.recyclerview.widget.RecyclerView'
        ];

        for (const selector of selectors) {
            try {
                const elements = await this.driver.$$(selector);
                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        const info = await this.getElementInfo(element);
                        if (!this.isDuplicate(this.foundElements.lists, info)) {
                            this.foundElements.lists.push(info);
                        }
                    }
                }
            } catch (error) {
                // Continue with next selector
            }
        }
        
        console.log(`   Found ${this.foundElements.lists.length} list elements`);
    }

    async findCheckboxes() {
        console.log('☑️ Finding checkboxes...');
        
        const selectors = [
            '//android.widget.CheckBox',
            '//*[@checkable="true"]'
        ];

        for (const selector of selectors) {
            try {
                const elements = await this.driver.$$(selector);
                for (const element of elements) {
                    if (await element.isDisplayed()) {
                        const info = await this.getElementInfo(element);
                        info.checked = await element.getAttribute('checked').catch(() => 'false');
                        if (!this.isDuplicate(this.foundElements.checkboxes, info)) {
                            this.foundElements.checkboxes.push(info);
                        }
                    }
                }
            } catch (error) {
                // Continue with next selector
            }
        }
        
        console.log(`   Found ${this.foundElements.checkboxes.length} checkboxes`);
    }

    async findCustomElements() {
        console.log('🎨 Finding custom elements...');
        
        try {
            const allElements = await this.driver.$$('//*[@resource-id]');
            
            for (const element of allElements.slice(0, 15)) {
                try {
                    if (await element.isDisplayed()) {
                        const resourceId = await element.getAttribute('resource-id');
                        const className = await element.getAttribute('class');
                        
                        if (resourceId && !className.startsWith('android.widget.') && 
                            !className.startsWith('android.view.')) {
                            const info = await this.getElementInfo(element);
                            if (!this.isDuplicate(this.foundElements.custom, info)) {
                                this.foundElements.custom.push(info);
                            }
                        }
                    }
                } catch (error) {
                    // Continue with next element
                }
            }
        } catch (error) {
            // Continue
        }
        
        console.log(`   Found ${this.foundElements.custom.length} custom elements`);
    }

    async getElementInfo(element) {
        try {
            const text = await element.getText().catch(() => '');
            const className = await element.getAttribute('class').catch(() => '');
            const resourceId = await element.getAttribute('resource-id').catch(() => '');
            const contentDesc = await element.getAttribute('content-desc').catch(() => '');
            const clickable = await element.getAttribute('clickable').catch(() => 'false');
            const enabled = await element.getAttribute('enabled').catch(() => 'true');
            const bounds = await element.getRect().catch(() => ({}));
            
            return {
                text: text.trim(),
                className,
                resourceId,
                contentDesc,
                clickable: clickable === 'true',
                enabled: enabled === 'true',
                bounds,
                selectors: this.generateSelectors(text, className, resourceId, contentDesc)
            };
        } catch (error) {
            return {
                text: '',
                className: '',
                resourceId: '',
                contentDesc: '',
                clickable: false,
                enabled: true,
                bounds: {},
                selectors: []
            };
        }
    }

    generateSelectors(text, className, resourceId, contentDesc) {
        const selectors = [];
        
        if (resourceId) {
            selectors.push(`//*[@resource-id="${resourceId}"]`);
            selectors.push(`android=new UiSelector().resourceId("${resourceId}")`);
        }
        
        if (text && text.trim()) {
            selectors.push(`//*[@text="${text.trim()}"]`);
            selectors.push(`android=new UiSelector().text("${text.trim()}")`);
        }
        
        if (contentDesc && contentDesc.trim()) {
            selectors.push(`//*[@content-desc="${contentDesc.trim()}"]`);
            selectors.push(`android=new UiSelector().description("${contentDesc.trim()}")`);
        }
        
        return selectors;
    }

    isDuplicate(array, newItem) {
        return array.some(item =>
            item.resourceId === newItem.resourceId &&
            item.text === newItem.text &&
            item.className === newItem.className
        );
    }
}

async function runElementFinder() {
    console.log('🚀 Starting Enhanced Element Discovery');
    console.log('=====================================\n');

    // Ensure directories exist
    const dirs = ['screenshots', 'test-results'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    let driver;

    try {
        // Connect to Appium
        console.log('📱 Connecting to Appium server...');
        driver = await remote({
            protocol: 'http',
            hostname: 'localhost',
            port: 4723,
            path: '/',
            capabilities
        });

        console.log('✅ Connected to device successfully!\n');

        // Wait for app to load
        console.log('⏳ Waiting for app to load...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Create element finder instance
        const finder = new ElementFinder(driver);

        // Find all element types
        const foundElements = await finder.findAllElementTypes();

        // Take screenshot
        await driver.saveScreenshot('./screenshots/element_discovery.png');

        // Save results
        const results = {
            timestamp: new Date().toISOString(),
            appInfo: {
                package: await driver.getCurrentPackage().catch(() => 'unknown'),
                activity: await driver.getCurrentActivity().catch(() => 'unknown'),
                windowSize: await driver.getWindowSize().catch(() => ({}))
            },
            elements: foundElements,
            summary: {
                totalButtons: foundElements.buttons.length,
                totalInputs: foundElements.inputs.length,
                totalTexts: foundElements.texts.length,
                totalImages: foundElements.images.length,
                totalLists: foundElements.lists.length,
                totalCheckboxes: foundElements.checkboxes.length,
                totalCustom: foundElements.custom.length
            }
        };

        fs.writeFileSync(
            './test-results/element_discovery.json',
            JSON.stringify(results, null, 2)
        );

        // Print detailed summary
        console.log('\n📊 ELEMENT DISCOVERY SUMMARY');
        console.log('============================');
        console.log(`🔘 Buttons: ${results.summary.totalButtons}`);
        console.log(`📝 Input Fields: ${results.summary.totalInputs}`);
        console.log(`📄 Text Elements: ${results.summary.totalTexts}`);
        console.log(`🖼️  Images: ${results.summary.totalImages}`);
        console.log(`📋 Lists: ${results.summary.totalLists}`);
        console.log(`☑️  Checkboxes: ${results.summary.totalCheckboxes}`);
        console.log(`🎨 Custom Elements: ${results.summary.totalCustom}`);

        // Show sample elements
        if (foundElements.buttons.length > 0) {
            console.log('\n🔘 Sample Buttons:');
            foundElements.buttons.slice(0, 3).forEach((btn, i) => {
                console.log(`   ${i + 1}. "${btn.text || btn.contentDesc || 'No text'}" (${btn.resourceId || 'No ID'})`);
            });
        }

        if (foundElements.inputs.length > 0) {
            console.log('\n📝 Sample Input Fields:');
            foundElements.inputs.slice(0, 3).forEach((input, i) => {
                console.log(`   ${i + 1}. Hint: "${input.text || 'No hint'}" Type: ${input.inputType || 'text'}`);
            });
        }

        console.log('\n📁 Generated Files:');
        console.log('- Element Discovery Results: ./test-results/element_discovery.json');
        console.log('- Screenshot: ./screenshots/element_discovery.png');

        console.log('\n🎯 Next Steps:');
        console.log('1. Review element_discovery.json for detailed element information');
        console.log('2. Run: node generate-tests.js to create test files');
        console.log('3. Customize tests based on discovered elements');

        return results;

    } catch (error) {
        console.error('❌ Element discovery failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('- Make sure Appium server is running: appium');
        console.log('- Check if device/emulator is connected: adb devices');
        console.log('- Verify APK path in the script');
    } finally {
        if (driver) {
            console.log('\n🔌 Closing connection...');
            await driver.deleteSession();
        }
    }
}

// Run if called directly
if (require.main === module) {
    runElementFinder().catch(console.error);
}

module.exports = { ElementFinder, runElementFinder };
