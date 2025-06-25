const path = require('path');

exports.config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './test/specs/**/*.js'
    ],
    
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        // Platform Name
        platformName: 'Android',
        
        // Device Name (for emulator) or leave empty for real device
        'appium:deviceName': 'Android Emulator',
        
        // Platform Version
        'appium:platformVersion': '15',
        
        // App Path - pointing to your APK file
        'appium:app': path.join(process.cwd(), 'app-dev-release.apk'),
        
        // Automation Name
        'appium:automationName': 'UiAutomator2',
        
        // Additional capabilities
        'appium:newCommandTimeout': 240,
        'appium:connectHardwareKeyboard': true,
        
        // For real device, uncomment and set the UDID
        // 'appium:udid': 'your-device-udid',
        
        // App package and activity (will be auto-detected from APK)
        // 'appium:appPackage': 'com.yourapp.package',
        // 'appium:appActivity': 'com.yourapp.MainActivity',
        
        // Reset app state
        'appium:noReset': false,
        'appium:fullReset': false
    }],
    
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Test framework
    framework: 'mocha',

    // Test reporter
    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],
    
    // Options to be passed to Mocha
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    
    // =====
    // Hooks
    // =====
    onPrepare: function (config, capabilities) {
        console.log('Starting Appium tests...');
    },
    
    onComplete: function(exitCode, config, capabilities, results) {
        console.log('All tests completed!');
    },
    
    beforeSession: function (config, capabilities, specs) {
        console.log('Starting new session...');
    },
    
    before: function (capabilities, specs) {
        // Set implicit wait
        browser.setTimeout({
            'implicit': 10000
        });
    },
    
    afterSession: function (config, capabilities, specs) {
        console.log('Session ended');
    },
    
    // ========
    // Services
    // ========
    services: [
        // Appium service disabled since we're running it manually
        // ['appium', {
        //     args: {
        //         address: 'localhost',
        //         port: 4723,
        //         relaxedSecurity: true,
        //         basePath: '/'
        //     },
        //     command: 'appium'
        // }]
    ],

    // Connection options
    protocol: 'http',
    hostname: 'localhost',
    port: 4723,
    path: '/'
};
