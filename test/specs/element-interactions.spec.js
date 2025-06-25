/**
 * Element Interaction Tests
 * Focused tests for specific UI element interactions
 */

const ProductionDataPage = require('../pageobjects/ProductionDataPage');
const TestHelpers = require('../helpers/TestHelpers');

describe('Production Data App - Element Interaction Tests', () => {
    
    let interactionResults = {
        timestamp: new Date().toISOString(),
        elementTests: [],
        summary: {
            totalElements: 0,
            successfulInteractions: 0,
            failedInteractions: 0
        }
    };

    before(async () => {
        console.log('\n🎯 Starting Element Interaction Tests');
        console.log('====================================\n');
        
        // Wait for app to be ready
        await ProductionDataPage.waitForPageLoad();
    });

    beforeEach(async () => {
        const testName = this.currentTest?.title || 'Unknown test';
        console.log(`\n🔍 Testing: ${testName}`);
    });

    afterEach(async () => {
        const testName = this.currentTest?.title || 'unknown_test';
        const testPassed = this.currentTest?.state === 'passed';
        
        // Take screenshot after each test
        await ProductionDataPage.takeScreenshot(`element_test_${testName.replace(/\s+/g, '_')}`);
        
        console.log(`Element test ${testName}: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);
    });

    it('should test main title element properties', async () => {
        const elementTest = {
            elementName: 'Main Title',
            selector: '//android.widget.TextView[@text="Production Data Collection"]',
            tests: {}
        };

        // Test visibility
        elementTest.tests.isDisplayed = await ProductionDataPage.mainTitle.isDisplayed();
        
        // Test text content
        const titleText = await ProductionDataPage.mainTitle.getText();
        elementTest.tests.textContent = titleText;
        elementTest.tests.hasCorrectText = titleText === 'Production Data Collection';
        
        // Test element properties
        elementTest.tests.isEnabled = await ProductionDataPage.mainTitle.isEnabled();
        elementTest.tests.isClickable = await ProductionDataPage.mainTitle.isClickable();
        
        // Test element bounds
        const bounds = await ProductionDataPage.mainTitle.getRect();
        elementTest.tests.bounds = bounds;
        elementTest.tests.hasValidBounds = bounds.width > 0 && bounds.height > 0;
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.hasCorrectText).toBe(true);
        expect(elementTest.tests.hasValidBounds).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Main Title Element Test:', elementTest);
    });

    it('should test specimen section element interactions', async () => {
        const elementTest = {
            elementName: 'Specimen Section',
            selector: '//*[@content-desc="🧪, 🔬, Specimen"]',
            tests: {}
        };

        // Test basic properties
        elementTest.tests.isDisplayed = await ProductionDataPage.specimenSection.isDisplayed();
        elementTest.tests.isClickable = await ProductionDataPage.specimenSection.isClickable();
        elementTest.tests.isEnabled = await ProductionDataPage.specimenSection.isEnabled();
        
        // Test content description
        const contentDesc = await ProductionDataPage.specimenSection.getAttribute('content-desc');
        elementTest.tests.contentDesc = contentDesc;
        elementTest.tests.hasContentDesc = contentDesc && contentDesc.includes('Specimen');
        
        // Test click interaction
        if (elementTest.tests.isClickable) {
            try {
                await ProductionDataPage.specimenSection.click();
                await browser.pause(1000);
                elementTest.tests.clickSuccessful = true;
                
                // Verify specimen text is still visible after click
                elementTest.tests.textVisibleAfterClick = await ProductionDataPage.specimenText.isDisplayed();
                
            } catch (error) {
                elementTest.tests.clickSuccessful = false;
                elementTest.tests.clickError = error.message;
            }
        }
        
        // Test individual specimen elements
        elementTest.tests.specimenIconDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.specimenIcon);
        elementTest.tests.specimenSubIconDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.specimenSubIcon);
        elementTest.tests.specimenTextDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.specimenText);
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.isClickable).toBe(true);
        expect(elementTest.tests.hasContentDesc).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Specimen Section Element Test:', elementTest);
    });

    it('should test dome section element interactions', async () => {
        const elementTest = {
            elementName: 'Dome Section',
            selector: '//*[@content-desc="Dome"]',
            tests: {}
        };

        // Test basic properties
        elementTest.tests.isDisplayed = await ProductionDataPage.domeSection.isDisplayed();
        elementTest.tests.isClickable = await ProductionDataPage.domeSection.isClickable();
        
        // Test dome text element
        elementTest.tests.domeTextDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.domeText);
        if (elementTest.tests.domeTextDisplayed) {
            const domeText = await ProductionDataPage.domeText.getText();
            elementTest.tests.domeTextContent = domeText;
            elementTest.tests.hasCorrectDomeText = domeText === 'Dome';
        }
        
        // Test dome icon button
        elementTest.tests.iconButtonDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.domeIconButton);
        if (elementTest.tests.iconButtonDisplayed) {
            elementTest.tests.iconButtonEnabled = await ProductionDataPage.domeIconButton.isEnabled();
            elementTest.tests.iconButtonClickable = await ProductionDataPage.domeIconButton.isClickable();
        }
        
        // Test click interaction
        if (elementTest.tests.isClickable) {
            try {
                await ProductionDataPage.domeSection.click();
                await browser.pause(1000);
                elementTest.tests.clickSuccessful = true;
                
                // Check if any state change occurred
                elementTest.tests.textStillVisible = await ProductionDataPage.domeText.isDisplayed();
                
            } catch (error) {
                elementTest.tests.clickSuccessful = false;
                elementTest.tests.clickError = error.message;
            }
        }
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.domeTextDisplayed).toBe(true);
        expect(elementTest.tests.hasCorrectDomeText).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Dome Section Element Test:', elementTest);
    });

    it('should test harvesting section element interactions', async () => {
        const elementTest = {
            elementName: 'Harvesting Section',
            selector: '//*[@content-desc="Harvesting"]',
            tests: {}
        };

        // Test basic properties
        elementTest.tests.isDisplayed = await ProductionDataPage.harvestingSection.isDisplayed();
        elementTest.tests.isClickable = await ProductionDataPage.harvestingSection.isClickable();
        
        // Test harvesting text
        elementTest.tests.harvestingTextDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.harvestingText);
        if (elementTest.tests.harvestingTextDisplayed) {
            const harvestingText = await ProductionDataPage.harvestingText.getText();
            elementTest.tests.harvestingTextContent = harvestingText;
            elementTest.tests.hasCorrectHarvestingText = harvestingText === 'Harvesting';
        }
        
        // Test harvesting icon button
        elementTest.tests.iconButtonDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.harvestingIconButton);
        if (elementTest.tests.iconButtonDisplayed) {
            elementTest.tests.iconButtonEnabled = await ProductionDataPage.harvestingIconButton.isEnabled();
        }
        
        // Test click interaction
        if (elementTest.tests.isClickable) {
            try {
                await ProductionDataPage.harvestingSection.click();
                await browser.pause(1000);
                elementTest.tests.clickSuccessful = true;
            } catch (error) {
                elementTest.tests.clickSuccessful = false;
                elementTest.tests.clickError = error.message;
            }
        }
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.harvestingTextDisplayed).toBe(true);
        expect(elementTest.tests.hasCorrectHarvestingText).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Harvesting Section Element Test:', elementTest);
    });

    it('should test media moisture section element interactions', async () => {
        const elementTest = {
            elementName: 'Media Moisture Section',
            selector: '//*[@content-desc="Media Moisture"]',
            tests: {}
        };

        // Test basic properties
        elementTest.tests.isDisplayed = await ProductionDataPage.mediaMoistureSection.isDisplayed();
        elementTest.tests.isClickable = await ProductionDataPage.mediaMoistureSection.isClickable();
        
        // Test media moisture text
        elementTest.tests.mediaMoistureTextDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.mediaMoistureText);
        if (elementTest.tests.mediaMoistureTextDisplayed) {
            const mediaMoistureText = await ProductionDataPage.mediaMoistureText.getText();
            elementTest.tests.mediaMoistureTextContent = mediaMoistureText;
            elementTest.tests.hasCorrectMediaMoistureText = mediaMoistureText === 'Media Moisture';
        }
        
        // Test media moisture icon button
        elementTest.tests.iconButtonDisplayed = await ProductionDataPage.isElementDisplayed(ProductionDataPage.mediaMoistureIconButton);
        if (elementTest.tests.iconButtonDisplayed) {
            elementTest.tests.iconButtonEnabled = await ProductionDataPage.mediaMoistureIconButton.isEnabled();
        }
        
        // Test click interaction
        if (elementTest.tests.isClickable) {
            try {
                await ProductionDataPage.mediaMoistureSection.click();
                await browser.pause(1000);
                elementTest.tests.clickSuccessful = true;
            } catch (error) {
                elementTest.tests.clickSuccessful = false;
                elementTest.tests.clickError = error.message;
            }
        }
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.mediaMoistureTextDisplayed).toBe(true);
        expect(elementTest.tests.hasCorrectMediaMoistureText).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Media Moisture Section Element Test:', elementTest);
    });

    it('should test scroll view element interactions', async () => {
        const elementTest = {
            elementName: 'Scroll View',
            selector: '//android.widget.ScrollView',
            tests: {}
        };

        // Test basic properties
        elementTest.tests.isDisplayed = await ProductionDataPage.scrollView.isDisplayed();
        elementTest.tests.isScrollable = await ProductionDataPage.scrollView.getAttribute('scrollable') === 'true';
        
        // Test scroll bounds
        const scrollBounds = await ProductionDataPage.scrollView.getRect();
        elementTest.tests.bounds = scrollBounds;
        elementTest.tests.hasValidScrollBounds = scrollBounds.width > 0 && scrollBounds.height > 0;
        
        // Test scroll functionality
        if (elementTest.tests.isDisplayed) {
            try {
                // Test scroll down
                await ProductionDataPage.scrollContent('down');
                await browser.pause(1000);
                elementTest.tests.scrollDownSuccessful = true;
                
                // Test scroll up
                await ProductionDataPage.scrollContent('up');
                await browser.pause(1000);
                elementTest.tests.scrollUpSuccessful = true;
                
                // Verify main title is still visible after scrolling
                elementTest.tests.titleVisibleAfterScroll = await ProductionDataPage.mainTitle.isDisplayed();
                
            } catch (error) {
                elementTest.tests.scrollError = error.message;
                elementTest.tests.scrollDownSuccessful = false;
                elementTest.tests.scrollUpSuccessful = false;
            }
        }
        
        // Assertions
        expect(elementTest.tests.isDisplayed).toBe(true);
        expect(elementTest.tests.hasValidScrollBounds).toBe(true);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Scroll View Element Test:', elementTest);
    });

    it('should test all icon buttons systematically', async () => {
        const iconButtonResults = await ProductionDataPage.testIconButtons();
        
        const elementTest = {
            elementName: 'All Icon Buttons',
            selector: '//android.widget.Button[@resource-id="icon-button"]',
            tests: {
                totalButtons: iconButtonResults.length,
                buttonDetails: iconButtonResults
            }
        };
        
        // Analyze results
        const displayedButtons = iconButtonResults.filter(btn => btn.isDisplayed);
        const enabledButtons = iconButtonResults.filter(btn => btn.isEnabled);
        const clickableButtons = iconButtonResults.filter(btn => btn.isClickable);
        const successfulClicks = iconButtonResults.filter(btn => btn.clickSuccessful);
        
        elementTest.tests.displayedCount = displayedButtons.length;
        elementTest.tests.enabledCount = enabledButtons.length;
        elementTest.tests.clickableCount = clickableButtons.length;
        elementTest.tests.successfulClicksCount = successfulClicks.length;
        
        // Update summary
        interactionResults.summary.totalElements += iconButtonResults.length;
        interactionResults.summary.successfulInteractions += successfulClicks.length;
        interactionResults.summary.failedInteractions += (iconButtonResults.length - successfulClicks.length);
        
        // Assertions
        expect(elementTest.tests.totalButtons).toBeGreaterThan(0);
        expect(elementTest.tests.displayedCount).toBeGreaterThan(0);
        
        interactionResults.elementTests.push(elementTest);
        console.log('Icon Buttons Test Summary:', {
            total: elementTest.tests.totalButtons,
            displayed: elementTest.tests.displayedCount,
            enabled: elementTest.tests.enabledCount,
            clickable: elementTest.tests.clickableCount,
            successfulClicks: elementTest.tests.successfulClicksCount
        });
    });

    it('should test dynamic element discovery and interaction', async () => {
        // Get all available sections dynamically
        const allSections = await ProductionDataPage.getAllAvailableSections();
        
        const elementTest = {
            elementName: 'Dynamic Sections',
            selector: '//*[@content-desc and @clickable="true"]',
            tests: {
                totalSections: allSections.length,
                sectionDetails: allSections,
                interactionResults: []
            }
        };
        
        // Test interaction with each discovered section
        for (let i = 0; i < allSections.length; i++) {
            const section = allSections[i];
            const interactionResult = {
                index: i,
                contentDesc: section.contentDesc,
                originallyDisplayed: section.isDisplayed,
                originallyClickable: section.isClickable
            };
            
            if (section.isDisplayed && section.isClickable) {
                try {
                    // Get the element again for interaction
                    const sectionElements = await ProductionDataPage.allSections;
                    if (sectionElements[i]) {
                        await sectionElements[i].click();
                        await browser.pause(1000);
                        interactionResult.clickSuccessful = true;
                        
                        // Test back navigation
                        await browser.back();
                        await browser.pause(1000);
                        interactionResult.backNavigationSuccessful = true;
                    }
                } catch (error) {
                    interactionResult.clickSuccessful = false;
                    interactionResult.error = error.message;
                }
            }
            
            elementTest.tests.interactionResults.push(interactionResult);
        }
        
        // Calculate success rate
        const successfulInteractions = elementTest.tests.interactionResults.filter(r => r.clickSuccessful).length;
        elementTest.tests.successRate = allSections.length > 0 ? (successfulInteractions / allSections.length) * 100 : 0;
        
        // Assertions
        expect(elementTest.tests.totalSections).toBeGreaterThan(0);
        expect(elementTest.tests.successRate).toBeGreaterThan(0);
        
        interactionResults.elementTests.push(elementTest);
        console.log(`Dynamic Element Test: ${elementTest.tests.totalSections} sections, ${elementTest.tests.successRate.toFixed(1)}% success rate`);
    });

    after(async () => {
        // Calculate final summary
        interactionResults.summary.totalElements = interactionResults.elementTests.reduce((sum, test) => {
            return sum + (test.tests.totalButtons || test.tests.totalSections || 1);
        }, 0);
        
        interactionResults.endTime = new Date().toISOString();
        
        console.log('\n📊 Element Interaction Test Summary');
        console.log('==================================');
        console.log(`Total Elements Tested: ${interactionResults.summary.totalElements}`);
        console.log(`Successful Interactions: ${interactionResults.summary.successfulInteractions}`);
        console.log(`Failed Interactions: ${interactionResults.summary.failedInteractions}`);
        console.log(`Success Rate: ${((interactionResults.summary.successfulInteractions / interactionResults.summary.totalElements) * 100).toFixed(1)}%`);
        
        // Save detailed results
        TestHelpers.saveTestResults('element_interactions', interactionResults);
        
        // Take final screenshot
        await ProductionDataPage.takeScreenshot('element_interactions_completed');
        
        console.log('\n📁 Detailed results saved to: ./test-results/element_interactions.json');
        console.log('🎉 Element interaction tests completed!');
    });
});
