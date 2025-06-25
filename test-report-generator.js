#!/usr/bin/env node

/**
 * Test Report Generator - Standalone Test
 * Tests the HTML report generation functionality
 */

const TestReportGenerator = require('./test/helpers/TestReportGenerator');

// Mock test results for demonstration
const mockTestResults = {
    suiteName: 'Production Data Collection App - Comprehensive Test',
    startTime: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    endTime: new Date().toISOString(),
    tests: [
        {
            name: 'App Launch and Main Screen Verification',
            status: 'passed',
            duration: 5000,
            details: 'App launched successfully and main screen verified',
            screenshots: ['test_start', 'main_screen_verified']
        },
        {
            name: 'Specimen Button Navigation Test',
            status: 'passed',
            duration: 8000,
            details: 'Specimen button clicked, screen changed, and successfully navigated back',
            screenshots: ['before_specimen_click', 'after_specimen_click_screen_change']
        },
        {
            name: 'Dome Button Expansion Test',
            status: 'passed',
            duration: 6000,
            details: 'Dome expanded successfully. Harvesting visible: true, Media Moisture visible: true',
            screenshots: ['before_dome_click', 'after_dome_expansion']
        },
        {
            name: 'Harvesting Button Navigation Test',
            status: 'passed',
            duration: 10000,
            details: 'Dome expanded, Harvesting button clicked, screen changed, and successfully navigated back',
            screenshots: ['before_harvesting_click', 'after_harvesting_click_screen_change']
        },
        {
            name: 'Media Moisture Button Navigation Test',
            status: 'passed',
            duration: 9000,
            details: 'Dome expanded, Media Moisture button clicked, screen changed, and successfully navigated back',
            screenshots: ['before_media_moisture_click', 'after_media_moisture_click_screen_change']
        },
        {
            name: 'Test Summary and Verification',
            status: 'passed',
            duration: 3000,
            details: 'All test scenarios completed successfully with proper navigation flow',
            screenshots: ['comprehensive_test_completed']
        }
    ],
    summary: {
        total: 6,
        passed: 6,
        failed: 0,
        successRate: 100
    }
};

async function testReportGeneration() {
    console.log('🧪 Testing HTML Report Generation...');
    console.log('=' .repeat(50));
    
    try {
        // Generate the report
        const reportPath = await TestReportGenerator.generateComprehensiveReport(mockTestResults);
        
        console.log('✅ HTML Report generated successfully!');
        console.log(`📄 Report location: ${reportPath}`);
        console.log(`📊 Test Summary: ${mockTestResults.summary.passed}/${mockTestResults.summary.total} tests passed`);
        console.log(`🎯 Success Rate: ${mockTestResults.summary.successRate}%`);
        
        // Check if files were created
        const fs = require('fs');
        const path = require('path');
        
        const htmlPath = path.join('./test-results', 'comprehensive_test_report.html');
        const jsonPath = path.join('./test-results', 'test_results.json');
        
        if (fs.existsSync(htmlPath)) {
            const stats = fs.statSync(htmlPath);
            console.log(`📄 HTML Report: ${htmlPath} (${Math.round(stats.size / 1024)}KB)`);
        }
        
        if (fs.existsSync(jsonPath)) {
            const stats = fs.statSync(jsonPath);
            console.log(`📊 JSON Results: ${jsonPath} (${Math.round(stats.size / 1024)}KB)`);
        }
        
        console.log('\n🎉 Report generation test completed successfully!');
        console.log('💡 You can now open the HTML report in your browser to see the results.');
        
    } catch (error) {
        console.error('❌ Report generation failed:', error.message);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testReportGeneration();
}
