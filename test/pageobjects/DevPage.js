/**
 * dev App Page Object
 * Generated automatically from UI inspection
 */

class DevPage {
    
    // Text Elements
    get productionDataCollectionText() { 
        return $('//android.widget.TextView[@text="Production Data Collection"]'); 
    }
    get element986722Text() { 
        return $('//android.widget.TextView[@text="&#986722;"]'); 
    }
    get element984085Text() { 
        return $('//android.widget.TextView[@text="&#984085;"]'); 
    }
    get specimenText() { 
        return $('//android.widget.TextView[@text="Specimen"]'); 
    }
    get domeText() { 
        return $('//android.widget.TextView[@text="Dome"]'); 
    }
    get element983904Text() { 
        return $('//android.widget.TextView[@text="&#983904;"]'); 
    }
    get element988356Text() { 
        return $('//android.widget.TextView[@text="&#988356;"]'); 
    }
    get harvestingText() { 
        return $('//android.widget.TextView[@text="Harvesting"]'); 
    }
    get element984465Text() { 
        return $('//android.widget.TextView[@text="&#984465;"]'); 
    }
    get mediaMoistureText() { 
        return $('//android.widget.TextView[@text="Media Moisture"]'); 
    }

    // Clickable Elements  
    get productionDataCollectionButton() { 
        return $('//*[@text="Production Data Collection"]'); 
    }
    get element986722Button() { 
        return $('//*[@text="&#986722;"]'); 
    }
    get element984085Button() { 
        return $('//*[@text="&#984085;"]'); 
    }
    get specimenButton() { 
        return $('//*[@text="Specimen"]'); 
    }
    get domeButton() { 
        return $('//*[@text="Dome"]'); 
    }
    get element983904Button() { 
        return $('//*[@text="&#983904;"]'); 
    }
    get element988356Button() { 
        return $('//*[@text="&#988356;"]'); 
    }
    get harvestingButton() { 
        return $('//*[@text="Harvesting"]'); 
    }
    get element984465Button() { 
        return $('//*[@text="&#984465;"]'); 
    }
    get mediaMoistureButton() { 
        return $('//*[@text="Media Moisture"]'); 
    }

    // Input Elements


    // Actions
    async waitForPageLoad() {
        await this.productionDataCollectionText.waitForDisplayed({ timeout: 10000 });
    }

    async takeScreenshot(name) {
        await browser.saveScreenshot(`./screenshots/${name}_${new Date().toISOString().replace(/[:.]/g, '-')}.png`);
    }

    async clickProductionDataCollection() {
        await this.productionDataCollectionButton.waitForDisplayed();
        await this.productionDataCollectionButton.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickElement986722() {
        await this.element986722Button.waitForDisplayed();
        await this.element986722Button.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickElement984085() {
        await this.element984085Button.waitForDisplayed();
        await this.element984085Button.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickSpecimen() {
        await this.specimenButton.waitForDisplayed();
        await this.specimenButton.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickDome() {
        await this.domeButton.waitForDisplayed();
        await this.domeButton.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickElement983904() {
        await this.element983904Button.waitForDisplayed();
        await this.element983904Button.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickElement988356() {
        await this.element988356Button.waitForDisplayed();
        await this.element988356Button.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickHarvesting() {
        await this.harvestingButton.waitForDisplayed();
        await this.harvestingButton.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickElement984465() {
        await this.element984465Button.waitForDisplayed();
        await this.element984465Button.click();
        await browser.pause(2000); // Wait for navigation
    }

    async clickMediaMoisture() {
        await this.mediaMoistureButton.waitForDisplayed();
        await this.mediaMoistureButton.click();
        await browser.pause(2000); // Wait for navigation
    }


}

module.exports = new DevPage();
