/**
 * Base Page Object Class
 * Contains common methods that can be used across all page objects
 */
class BasePage {
    
    /**
     * Wait for an element to be displayed
     * @param {WebdriverIO.Element} element - The element to wait for
     * @param {number} timeout - Timeout in milliseconds (default: 10000)
     */
    async waitForDisplayed(element, timeout = 10000) {
        await element.waitForDisplayed({ timeout });
    }
    
    /**
     * Wait for an element to be clickable
     * @param {WebdriverIO.Element} element - The element to wait for
     * @param {number} timeout - Timeout in milliseconds (default: 10000)
     */
    async waitForClickable(element, timeout = 10000) {
        await element.waitForClickable({ timeout });
    }
    
    /**
     * Click on an element with wait
     * @param {WebdriverIO.Element} element - The element to click
     */
    async clickElement(element) {
        await this.waitForClickable(element);
        await element.click();
    }
    
    /**
     * Set text in an input field
     * @param {WebdriverIO.Element} element - The input element
     * @param {string} text - Text to enter
     */
    async setText(element, text) {
        await this.waitForDisplayed(element);
        await element.clearValue();
        await element.setValue(text);
    }
    
    /**
     * Get text from an element
     * @param {WebdriverIO.Element} element - The element to get text from
     * @returns {Promise<string>} The text content
     */
    async getText(element) {
        await this.waitForDisplayed(element);
        return await element.getText();
    }
    
    /**
     * Check if element is displayed
     * @param {WebdriverIO.Element} element - The element to check
     * @returns {Promise<boolean>} True if displayed, false otherwise
     */
    async isDisplayed(element) {
        try {
            return await element.isDisplayed();
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Scroll to element
     * @param {WebdriverIO.Element} element - The element to scroll to
     */
    async scrollToElement(element) {
        await element.scrollIntoView();
    }
    
    /**
     * Take a screenshot
     * @param {string} filename - Name for the screenshot file
     */
    async takeScreenshot(filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotName = `${filename}_${timestamp}.png`;
        await browser.saveScreenshot(`./screenshots/${screenshotName}`);
        console.log(`Screenshot saved: ${screenshotName}`);
    }
    
    /**
     * Wait for app to load (generic wait)
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     */
    async waitForAppToLoad(timeout = 5000) {
        await browser.pause(timeout);
    }
    
    /**
     * Swipe on screen
     * @param {string} direction - Direction to swipe: 'up', 'down', 'left', 'right'
     * @param {number} distance - Distance to swipe (0-1, default: 0.5)
     */
    async swipe(direction, distance = 0.5) {
        const { width, height } = await browser.getWindowSize();
        const centerX = width / 2;
        const centerY = height / 2;
        
        let startX, startY, endX, endY;
        
        switch (direction.toLowerCase()) {
            case 'up':
                startX = centerX;
                startY = centerY + (height * distance / 2);
                endX = centerX;
                endY = centerY - (height * distance / 2);
                break;
            case 'down':
                startX = centerX;
                startY = centerY - (height * distance / 2);
                endX = centerX;
                endY = centerY + (height * distance / 2);
                break;
            case 'left':
                startX = centerX + (width * distance / 2);
                startY = centerY;
                endX = centerX - (width * distance / 2);
                endY = centerY;
                break;
            case 'right':
                startX = centerX - (width * distance / 2);
                startY = centerY;
                endX = centerX + (width * distance / 2);
                endY = centerY;
                break;
            default:
                throw new Error(`Invalid swipe direction: ${direction}`);
        }
        
        await browser.touchAction([
            { action: 'press', x: startX, y: startY },
            { action: 'wait', ms: 1000 },
            { action: 'moveTo', x: endX, y: endY },
            { action: 'release' }
        ]);
    }
}

module.exports = BasePage;
