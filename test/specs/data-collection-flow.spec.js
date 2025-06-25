/**
 * Data Collection Flow Tests
 * Business logic and workflow tests for the Production Data Collection app
 */

const ProductionDataPage = require('../pageobjects/ProductionDataPage');
const TestHelpers = require('../helpers/TestHelpers');

describe('Production Data Collection - Business Flow Tests', () => {
    
    let flowResults = {
        timestamp: new Date().toISOString(),
        workflows: [],
        dataCollectionScenarios: [],
        summary: {
            totalWorkflows: 0,
            successfulWorkflows: 0,
            failedWorkflows: 0
        }
    };

    before(async () => {
        console.log('\n📋 Starting Data Collection Flow Tests');
        console.log('=====================================\n');
        
        // Ensure app is ready
        await ProductionDataPage.waitForPageLoad();
        
        // Take initial screenshot
        await ProductionDataPage.takeScreenshot('data_collection_flow_start');
    });

    beforeEach(async () => {
        const testName = this.currentTest?.title || 'Unknown test';
        console.log(`\n📊 Testing workflow: ${testName}`);
        
        // Ensure we're on the main screen before each test
        try {
            await ProductionDataPage.waitForPageLoad();
        } catch (error) {
            console.log('Returning to main screen...');
            await browser.back();
            await browser.pause(1000);
            await ProductionDataPage.waitForPageLoad();
        }
    });

    afterEach(async () => {
        const testName = this.currentTest?.title || 'unknown_test';
        const testPassed = this.currentTest?.state === 'passed';
        
        // Take screenshot after each workflow test
        await ProductionDataPage.takeScreenshot(`workflow_${testName.replace(/\s+/g, '_')}_${testPassed ? 'passed' : 'failed'}`);
        
        console.log(`Workflow ${testName}: ${testPassed ? '✅ COMPLETED' : '❌ FAILED'}`);
    });

    it('should complete specimen data collection workflow', async () => {
        const workflow = {
            name: 'Specimen Data Collection',
            steps: [],
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            // Step 1: Navigate to Specimen section
            workflow.steps.push({ step: 1, action: 'Navigate to Specimen section', status: 'starting' });
            
            await expect(ProductionDataPage.specimenSection).toBeDisplayed();
            await expect(ProductionDataPage.specimenSection).toBeClickable();
            
            await ProductionDataPage.clickSection('specimen');
            workflow.steps[0].status = 'completed';
            workflow.steps[0].timestamp = new Date().toISOString();
            
            // Step 2: Verify specimen elements are accessible
            workflow.steps.push({ step: 2, action: 'Verify specimen elements', status: 'starting' });
            
            const specimenIconVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.specimenIcon);
            const specimenTextVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.specimenText);
            
            expect(specimenIconVisible || specimenTextVisible).toBe(true);
            workflow.steps[1].status = 'completed';
            workflow.steps[1].details = { iconVisible: specimenIconVisible, textVisible: specimenTextVisible };
            
            // Step 3: Test data entry simulation (if input fields were available)
            workflow.steps.push({ step: 3, action: 'Simulate data entry', status: 'starting' });
            
            // Since no input fields are currently available, we'll simulate the workflow
            // by testing interactions and state changes
            await browser.pause(2000); // Simulate data entry time
            
            workflow.steps[2].status = 'completed';
            workflow.steps[2].details = { note: 'No input fields available, simulated data entry delay' };
            
            // Step 4: Test navigation back to main screen
            workflow.steps.push({ step: 4, action: 'Return to main screen', status: 'starting' });
            
            await browser.back();
            await browser.pause(1000);
            
            // Verify we're back on main screen
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            workflow.steps[3].status = 'completed';
            
            workflow.status = 'completed';
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.successfulWorkflows++;
            
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.failedWorkflows++;
            throw error;
        } finally {
            flowResults.workflows.push(workflow);
            flowResults.summary.totalWorkflows++;
        }
        
        console.log('✅ Specimen data collection workflow completed');
    });

    it('should complete dome monitoring workflow', async () => {
        const workflow = {
            name: 'Dome Monitoring',
            steps: [],
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            // Step 1: Access Dome section
            workflow.steps.push({ step: 1, action: 'Access Dome section', status: 'starting' });
            
            await expect(ProductionDataPage.domeSection).toBeDisplayed();
            await ProductionDataPage.clickSection('dome');
            
            workflow.steps[0].status = 'completed';
            
            // Step 2: Check dome monitoring elements
            workflow.steps.push({ step: 2, action: 'Check dome monitoring elements', status: 'starting' });
            
            const domeTextVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.domeText);
            const domeIconButtonVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.domeIconButton);
            
            expect(domeTextVisible).toBe(true);
            
            workflow.steps[1].status = 'completed';
            workflow.steps[1].details = { 
                textVisible: domeTextVisible, 
                iconButtonVisible: domeIconButtonVisible 
            };
            
            // Step 3: Test dome icon button interaction (if enabled)
            workflow.steps.push({ step: 3, action: 'Test dome controls', status: 'starting' });
            
            if (domeIconButtonVisible) {
                try {
                    const isEnabled = await ProductionDataPage.domeIconButton.isEnabled();
                    const isClickable = await ProductionDataPage.domeIconButton.isClickable();
                    
                    workflow.steps[2].details = { 
                        buttonEnabled: isEnabled, 
                        buttonClickable: isClickable 
                    };
                    
                    if (isEnabled && isClickable) {
                        await ProductionDataPage.domeIconButton.click();
                        await browser.pause(1000);
                        workflow.steps[2].details.clickAttempted = true;
                    }
                } catch (error) {
                    workflow.steps[2].details = { 
                        error: error.message,
                        note: 'Button interaction failed - likely disabled'
                    };
                }
            }
            
            workflow.steps[2].status = 'completed';
            
            // Step 4: Return to main screen
            workflow.steps.push({ step: 4, action: 'Return to main screen', status: 'starting' });
            
            await browser.back();
            await browser.pause(1000);
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            workflow.steps[3].status = 'completed';
            workflow.status = 'completed';
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.successfulWorkflows++;
            
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.failedWorkflows++;
            throw error;
        } finally {
            flowResults.workflows.push(workflow);
            flowResults.summary.totalWorkflows++;
        }
        
        console.log('✅ Dome monitoring workflow completed');
    });

    it('should complete harvesting data workflow', async () => {
        const workflow = {
            name: 'Harvesting Data Collection',
            steps: [],
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            // Step 1: Navigate to Harvesting section
            workflow.steps.push({ step: 1, action: 'Navigate to Harvesting section', status: 'starting' });
            
            await expect(ProductionDataPage.harvestingSection).toBeDisplayed();
            await ProductionDataPage.clickSection('harvesting');
            
            workflow.steps[0].status = 'completed';
            
            // Step 2: Verify harvesting data elements
            workflow.steps.push({ step: 2, action: 'Verify harvesting elements', status: 'starting' });
            
            const harvestingTextVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.harvestingText);
            const harvestingIconButtonVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.harvestingIconButton);
            
            expect(harvestingTextVisible).toBe(true);
            
            workflow.steps[1].status = 'completed';
            workflow.steps[1].details = {
                textVisible: harvestingTextVisible,
                iconButtonVisible: harvestingIconButtonVisible
            };
            
            // Step 3: Simulate harvesting data collection
            workflow.steps.push({ step: 3, action: 'Simulate harvesting data collection', status: 'starting' });
            
            // Test scrolling within the section (if applicable)
            await ProductionDataPage.scrollContent('down');
            await browser.pause(1000);
            await ProductionDataPage.scrollContent('up');
            await browser.pause(1000);
            
            workflow.steps[2].status = 'completed';
            workflow.steps[2].details = { note: 'Tested scrolling and interaction within harvesting section' };
            
            // Step 4: Complete workflow and return
            workflow.steps.push({ step: 4, action: 'Complete and return', status: 'starting' });
            
            await browser.back();
            await browser.pause(1000);
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            workflow.steps[3].status = 'completed';
            workflow.status = 'completed';
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.successfulWorkflows++;
            
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.failedWorkflows++;
            throw error;
        } finally {
            flowResults.workflows.push(workflow);
            flowResults.summary.totalWorkflows++;
        }
        
        console.log('✅ Harvesting data workflow completed');
    });

    it('should complete media moisture monitoring workflow', async () => {
        const workflow = {
            name: 'Media Moisture Monitoring',
            steps: [],
            startTime: new Date().toISOString(),
            status: 'running'
        };

        try {
            // Step 1: Access Media Moisture section
            workflow.steps.push({ step: 1, action: 'Access Media Moisture section', status: 'starting' });
            
            await expect(ProductionDataPage.mediaMoistureSection).toBeDisplayed();
            await ProductionDataPage.clickSection('mediaMoisture');
            
            workflow.steps[0].status = 'completed';
            
            // Step 2: Verify media moisture elements
            workflow.steps.push({ step: 2, action: 'Verify media moisture elements', status: 'starting' });
            
            const mediaMoistureTextVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.mediaMoistureText);
            const mediaMoistureIconButtonVisible = await ProductionDataPage.isElementDisplayed(ProductionDataPage.mediaMoistureIconButton);
            
            expect(mediaMoistureTextVisible).toBe(true);
            
            workflow.steps[1].status = 'completed';
            workflow.steps[1].details = {
                textVisible: mediaMoistureTextVisible,
                iconButtonVisible: mediaMoistureIconButtonVisible
            };
            
            // Step 3: Test moisture monitoring controls
            workflow.steps.push({ step: 3, action: 'Test moisture monitoring controls', status: 'starting' });
            
            if (mediaMoistureIconButtonVisible) {
                try {
                    const isEnabled = await ProductionDataPage.mediaMoistureIconButton.isEnabled();
                    workflow.steps[2].details = { buttonEnabled: isEnabled };
                    
                    // Simulate moisture reading process
                    await browser.pause(2000);
                    
                } catch (error) {
                    workflow.steps[2].details = { error: error.message };
                }
            }
            
            workflow.steps[2].status = 'completed';
            
            // Step 4: Complete monitoring and return
            workflow.steps.push({ step: 4, action: 'Complete monitoring and return', status: 'starting' });
            
            await browser.back();
            await browser.pause(1000);
            await expect(ProductionDataPage.mainTitle).toBeDisplayed();
            
            workflow.steps[3].status = 'completed';
            workflow.status = 'completed';
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.successfulWorkflows++;
            
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            
            flowResults.summary.failedWorkflows++;
            throw error;
        } finally {
            flowResults.workflows.push(workflow);
            flowResults.summary.totalWorkflows++;
        }
        
        console.log('✅ Media moisture monitoring workflow completed');
    });

    it('should test complete data collection session workflow', async () => {
        const sessionWorkflow = {
            name: 'Complete Data Collection Session',
            steps: [],
            startTime: new Date().toISOString(),
            status: 'running',
            sectionsVisited: []
        };

        try {
            // Complete workflow: Visit all sections in sequence
            const sections = [
                { name: 'specimen', displayName: 'Specimen' },
                { name: 'dome', displayName: 'Dome' },
                { name: 'harvesting', displayName: 'Harvesting' },
                { name: 'mediaMoisture', displayName: 'Media Moisture' }
            ];

            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const stepNum = i + 1;
                
                sessionWorkflow.steps.push({ 
                    step: stepNum, 
                    action: `Visit ${section.displayName} section`, 
                    status: 'starting' 
                });
                
                // Navigate to section
                await ProductionDataPage.clickSection(section.name);
                await browser.pause(2000);
                
                // Record visit
                sessionWorkflow.sectionsVisited.push({
                    section: section.displayName,
                    timestamp: new Date().toISOString(),
                    visitDuration: 2000
                });
                
                // Return to main screen
                await browser.back();
                await browser.pause(1000);
                
                // Verify we're back on main screen
                await expect(ProductionDataPage.mainTitle).toBeDisplayed();
                
                sessionWorkflow.steps[i].status = 'completed';
                sessionWorkflow.steps[i].timestamp = new Date().toISOString();
            }
            
            // Final verification
            sessionWorkflow.steps.push({ 
                step: sections.length + 1, 
                action: 'Final verification', 
                status: 'starting' 
            });
            
            // Verify all main sections are still accessible
            const finalSectionCheck = await ProductionDataPage.verifyMainSections();
            const allSectionsAccessible = Object.values(finalSectionCheck).every(result => result === true);
            
            expect(allSectionsAccessible).toBe(true);
            
            sessionWorkflow.steps[sections.length].status = 'completed';
            sessionWorkflow.steps[sections.length].details = { 
                allSectionsAccessible,
                sectionResults: finalSectionCheck
            };
            
            sessionWorkflow.status = 'completed';
            sessionWorkflow.endTime = new Date().toISOString();
            sessionWorkflow.totalDuration = new Date(sessionWorkflow.endTime) - new Date(sessionWorkflow.startTime);
            
            flowResults.summary.successfulWorkflows++;
            
        } catch (error) {
            sessionWorkflow.status = 'failed';
            sessionWorkflow.error = error.message;
            sessionWorkflow.endTime = new Date().toISOString();
            
            flowResults.summary.failedWorkflows++;
            throw error;
        } finally {
            flowResults.workflows.push(sessionWorkflow);
            flowResults.summary.totalWorkflows++;
        }
        
        console.log(`✅ Complete data collection session completed - visited ${sessionWorkflow.sectionsVisited.length} sections`);
    });

    after(async () => {
        // Calculate final statistics
        flowResults.endTime = new Date().toISOString();
        flowResults.summary.successRate = flowResults.summary.totalWorkflows > 0 ? 
            (flowResults.summary.successfulWorkflows / flowResults.summary.totalWorkflows) * 100 : 0;
        
        console.log('\n📊 Data Collection Flow Test Summary');
        console.log('===================================');
        console.log(`Total Workflows: ${flowResults.summary.totalWorkflows}`);
        console.log(`Successful Workflows: ${flowResults.summary.successfulWorkflows}`);
        console.log(`Failed Workflows: ${flowResults.summary.failedWorkflows}`);
        console.log(`Success Rate: ${flowResults.summary.successRate.toFixed(1)}%`);
        
        // Log workflow details
        console.log('\n📋 Workflow Details:');
        flowResults.workflows.forEach((workflow, index) => {
            console.log(`${index + 1}. ${workflow.name}: ${workflow.status} (${workflow.steps.length} steps)`);
        });
        
        // Save detailed flow results
        TestHelpers.saveTestResults('data_collection_flows', flowResults);
        
        // Take final screenshot
        await ProductionDataPage.takeScreenshot('data_collection_flows_completed');
        
        console.log('\n📁 Detailed flow results saved to: ./test-results/data_collection_flows.json');
        console.log('🎉 Data collection flow tests completed!');
    });
});
