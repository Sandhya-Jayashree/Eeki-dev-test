/**
 * Production Data Collection App Page Object
 * Based on discovered UI elements from app inspection
 */

class ProductionDataPage {
    
    // Main Screen Elements
    get mainTitle() {
        return $('//android.widget.TextView[@text="Production Data Collection"]');
    }
    
    // Specimen Section Elements
    get specimenSection() {
        return $('//*[@content-desc="🧪, 🔬, Specimen"]');
    }
    
    get specimenText() {
        return $('//android.widget.TextView[@text="Specimen"]');
    }
    
    get specimenIcon() {
        return $('//android.widget.TextView[@text="🧪"]');
    }
    
    get specimenSubIcon() {
        return $('//android.widget.TextView[@text="🔬"]');
    }
    
    // Dome Section Elements
    get domeSection() {
        return $('//*[@content-desc="Dome"]');
    }
    
    get domeText() {
        return $('//android.widget.TextView[@text="Dome"]');
    }
    
    get domeIconButton() {
        return $('//android.view.ViewGroup[@resource-id="icon-button-container"]//android.widget.Button[@resource-id="icon-button"]');
    }
    
    get domeIcon() {
        return $('//android.widget.TextView[@text="🏠"]');
    }
    
    // Harvesting Section Elements
    get harvestingSection() {
        return $('//*[@content-desc="Harvesting"]');
    }
    
    get harvestingText() {
        return $('//android.widget.TextView[@text="Harvesting"]');
    }
    
    get harvestingIconButton() {
        return $('(//android.view.ViewGroup[@resource-id="icon-button-container"]//android.widget.Button[@resource-id="icon-button"])[2]');
    }
    
    get harvestingIcon() {
        return $('//android.widget.TextView[@text="🌾"]');
    }
    
    // Media Moisture Section Elements
    get mediaMoistureSection() {
        return $('//*[@content-desc="Media Moisture"]');
    }
    
    get mediaMoistureText() {
        return $('//android.widget.TextView[@text="Media Moisture"]');
    }
    
    get mediaMoistureIconButton() {
        return $('(//android.view.ViewGroup[@resource-id="icon-button-container"]//android.widget.Button[@resource-id="icon-button"])[3]');
    }
    
    get mediaMoistureIcon() {
        return $('//android.widget.TextView[@text="💧"]');
    }
    
    // Scrollable Container
    get scrollView() {
        return $('//android.widget.ScrollView');
    }
    
    // Generic selectors for dynamic elements
    get allSections() {
        return $$('//*[@content-desc and @clickable="true"]');
    }
    
    get allIconButtons() {
        return $$('//android.widget.Button[@resource-id="icon-button"]');
    }
    
    get allTextElements() {
        return $$('//android.widget.TextView[@text]');
    }

    /**
     * Wait for the main production data screen to load
     */
    async waitForPageLoad() {
        console.log('Waiting for Production Data Collection page to load...');
        await this.mainTitle.waitForDisplayed({ timeout: 15000 });
        await this.takeScreenshot('production_data_page_loaded');
    }

    /**
     * Verify all main sections are displayed
     */
    async verifyMainSections() {
        console.log('Verifying main sections are displayed...');
        
        const sections = [
            { element: this.specimenSection, name: 'Specimen' },
            { element: this.domeSection, name: 'Dome' },
            { element: this.harvestingSection, name: 'Harvesting' },
            { element: this.mediaMoistureSection, name: 'Media Moisture' }
        ];
        
        const results = {};
        
        for (const section of sections) {
            try {
                const isDisplayed = await section.element.isDisplayed();
                results[section.name] = isDisplayed;
                console.log(`${section.name} section: ${isDisplayed ? '✅ Visible' : '❌ Not visible'}`);
            } catch (error) {
                results[section.name] = false;
                console.log(`${section.name} section: ❌ Error - ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Click on a specific section
     */
    async clickSection(sectionName) {
        console.log(`Clicking on ${sectionName} section...`);
        
        const sectionMap = {
            'specimen': this.specimenSection,
            'dome': this.domeSection,
            'harvesting': this.harvestingSection,
            'mediaMoisture': this.mediaMoistureSection
        };
        
        const section = sectionMap[sectionName.toLowerCase()];
        if (!section) {
            throw new Error(`Unknown section: ${sectionName}`);
        }
        
        await section.waitForDisplayed({ timeout: 10000 });
        await section.click();
        await browser.pause(2000); // Wait for any navigation or state change
        await this.takeScreenshot(`after_clicking_${sectionName.toLowerCase()}`);
    }

    /**
     * Scroll within the main content area
     */
    async scrollContent(direction = 'down', distance = 0.5) {
        console.log(`Scrolling content ${direction}...`);
        
        const scrollElement = await this.scrollView;
        if (await scrollElement.isDisplayed()) {
            const rect = await scrollElement.getRect();
            const centerX = rect.x + (rect.width / 2);
            const startY = direction === 'down' ? rect.y + (rect.height * 0.7) : rect.y + (rect.height * 0.3);
            const endY = direction === 'down' ? rect.y + (rect.height * 0.3) : rect.y + (rect.height * 0.7);
            
            await browser.touchAction([
                { action: 'press', x: centerX, y: startY },
                { action: 'wait', ms: 1000 },
                { action: 'moveTo', x: centerX, y: endY },
                { action: 'release' }
            ]);
            
            await browser.pause(1000);
            await this.takeScreenshot(`after_scroll_${direction}`);
        } else {
            console.log('ScrollView not found or not displayed');
        }
    }

    /**
     * Get all available sections dynamically
     */
    async getAllAvailableSections() {
        console.log('Getting all available sections...');
        
        const sections = await this.allSections;
        const sectionInfo = [];
        
        for (let i = 0; i < sections.length; i++) {
            try {
                const section = sections[i];
                const contentDesc = await section.getAttribute('content-desc');
                const isDisplayed = await section.isDisplayed();
                const isClickable = await section.isClickable();
                
                sectionInfo.push({
                    index: i,
                    contentDesc,
                    isDisplayed,
                    isClickable
                });
            } catch (error) {
                console.log(`Error getting section ${i}: ${error.message}`);
            }
        }
        
        console.log(`Found ${sectionInfo.length} sections:`, sectionInfo);
        return sectionInfo;
    }

    /**
     * Test icon button interactions
     */
    async testIconButtons() {
        console.log('Testing icon button interactions...');
        
        const iconButtons = await this.allIconButtons;
        const results = [];
        
        for (let i = 0; i < iconButtons.length; i++) {
            try {
                const button = iconButtons[i];
                const isDisplayed = await button.isDisplayed();
                const isEnabled = await button.isEnabled();
                const isClickable = await button.isClickable();
                
                const result = {
                    index: i,
                    isDisplayed,
                    isEnabled,
                    isClickable
                };
                
                // Try to click if enabled and clickable
                if (isEnabled && isClickable) {
                    await button.click();
                    await browser.pause(1000);
                    result.clickSuccessful = true;
                    await this.takeScreenshot(`icon_button_${i}_clicked`);
                } else {
                    result.clickSuccessful = false;
                    result.reason = !isEnabled ? 'disabled' : 'not clickable';
                }
                
                results.push(result);
                console.log(`Icon button ${i}: ${JSON.stringify(result)}`);
                
            } catch (error) {
                results.push({
                    index: i,
                    error: error.message
                });
                console.log(`Error testing icon button ${i}: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Perform comprehensive element discovery
     */
    async discoverAllElements() {
        console.log('Performing comprehensive element discovery...');
        
        const discovery = {
            timestamp: new Date().toISOString(),
            mainTitle: await this.isElementDisplayed(this.mainTitle),
            sections: await this.getAllAvailableSections(),
            iconButtons: await this.testIconButtons(),
            scrollView: await this.isElementDisplayed(this.scrollView),
            allTextElements: []
        };
        
        // Get all text elements
        try {
            const textElements = await this.allTextElements;
            for (let i = 0; i < Math.min(textElements.length, 20); i++) {
                const element = textElements[i];
                const text = await element.getText();
                const isDisplayed = await element.isDisplayed();
                
                if (text && text.trim()) {
                    discovery.allTextElements.push({
                        index: i,
                        text: text.trim(),
                        isDisplayed
                    });
                }
            }
        } catch (error) {
            console.log(`Error discovering text elements: ${error.message}`);
        }
        
        console.log('Element discovery completed:', discovery);
        return discovery;
    }

    /**
     * Helper method to check if element is displayed
     */
    async isElementDisplayed(element) {
        try {
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }

    /**
     * Take a screenshot with a given name
     */
    async takeScreenshot(name) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            await browser.saveScreenshot(`./screenshots/${filename}`);
            console.log(`Screenshot saved: ${filename}`);
        } catch (error) {
            console.log(`Failed to take screenshot: ${error.message}`);
        }
    }

    /**
     * Navigate back using Android back button
     */
    async navigateBack() {
        try {
            console.log('Pressing back button...');
            await browser.back();
            await browser.pause(2000); // Wait for navigation
            await this.takeScreenshot('after_back_navigation');
        } catch (error) {
            console.log(`Failed to navigate back: ${error.message}`);
        }
    }
}

module.exports = new ProductionDataPage();
