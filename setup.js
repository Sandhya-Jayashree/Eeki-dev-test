#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 APK Automation Testing Setup');
console.log('================================\n');

/**
 * Execute command and handle errors
 */
function executeCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        console.log(`✅ ${description} completed`);
        return output;
    } catch (error) {
        console.log(`❌ ${description} failed: ${error.message}`);
        return null;
    }
}

/**
 * Check if a command exists (Windows compatible)
 */
function commandExists(command) {
    try {
        // Use 'where' on Windows, 'which' on Unix/Mac
        const checkCommand = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
        execSync(checkCommand, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    const checks = [
        { command: 'node', name: 'Node.js', required: true },
        { command: 'npm', name: 'npm', required: true },
        { command: 'java', name: 'Java', required: true },
        { command: 'adb', name: 'Android Debug Bridge (ADB)', required: true },
        { command: 'appium', name: 'Appium', required: false }
    ];
    
    let allRequired = true;
    
    checks.forEach(check => {
        if (commandExists(check.command)) {
            console.log(`✅ ${check.name} is installed`);
            
            // Get version info
            try {
                let versionCommand = `${check.command} --version`;
                if (check.command === 'java') versionCommand = 'java -version';
                if (check.command === 'adb') versionCommand = 'adb version';
                
                const version = execSync(versionCommand, { encoding: 'utf8', stdio: 'pipe' });
                console.log(`   Version: ${version.split('\n')[0]}`);
            } catch (error) {
                // Version check failed, but command exists
            }
        } else {
            const status = check.required ? '❌' : '⚠️';
            console.log(`${status} ${check.name} is not installed`);
            if (check.required) allRequired = false;
        }
    });
    
    console.log('');
    return allRequired;
}

/**
 * Check Android environment (Windows compatible)
 */
function checkAndroidEnvironment() {
    console.log('📱 Checking Android environment...\n');

    // Check ANDROID_HOME
    let androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

    if (!androidHome) {
        // Try to detect common Android SDK paths on Windows
        const commonPaths = [
            path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk'),
            path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Android', 'Sdk'),
            'C:\\Android\\Sdk',
            'C:\\Users\\' + (process.env.USERNAME || '') + '\\AppData\\Local\\Android\\Sdk'
        ];

        for (const testPath of commonPaths) {
            if (fs.existsSync(testPath)) {
                androidHome = testPath;
                console.log(`✅ Android SDK detected at: ${androidHome}`);
                console.log('   Consider setting ANDROID_HOME environment variable');
                break;
            }
        }
    }

    if (androidHome) {
        console.log(`✅ ANDROID_HOME is set: ${androidHome}`);

        // Check if ADB exists in the SDK
        const adbPath = path.join(androidHome, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
        if (fs.existsSync(adbPath)) {
            console.log(`✅ ADB found at: ${adbPath}`);
        } else {
            console.log('⚠️  ADB not found in Android SDK platform-tools');
        }
    } else {
        console.log('⚠️  ANDROID_HOME environment variable is not set');
        console.log('   Please set ANDROID_HOME to your Android SDK path');
        console.log('   Common Windows locations:');
        console.log('   - %LOCALAPPDATA%\\Android\\Sdk');
        console.log('   - C:\\Android\\Sdk');
    }

    // Check connected devices
    const devices = executeCommand('adb devices', 'Checking connected Android devices');
    if (devices) {
        const deviceLines = devices.split('\n').filter(line => line.includes('\t'));
        if (deviceLines.length > 0) {
            console.log(`✅ Found ${deviceLines.length} connected device(s):`);
            deviceLines.forEach(line => {
                const [deviceId, status] = line.split('\t');
                console.log(`   - ${deviceId} (${status})`);
            });
        } else {
            console.log('⚠️  No Android devices connected');
            console.log('   Please connect a device or start an emulator');
        }
    }

    console.log('');
}

/**
 * Check and fix PowerShell execution policy on Windows
 */
function checkPowerShellPolicy() {
    if (process.platform === 'win32') {
        console.log('🔒 Checking PowerShell execution policy...\n');

        try {
            const policy = execSync('powershell -Command "Get-ExecutionPolicy"', { encoding: 'utf8' }).trim();
            console.log(`Current execution policy: ${policy}`);

            if (policy === 'Restricted') {
                console.log('⚠️  PowerShell execution policy is Restricted');
                console.log('   This may prevent Appium from running properly');
                console.log('   Consider running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');
                console.log('   Or run commands with: powershell -ExecutionPolicy Bypass -Command "your-command"\n');
            } else {
                console.log('✅ PowerShell execution policy allows script execution\n');
            }
        } catch (error) {
            console.log('⚠️  Could not check PowerShell execution policy\n');
        }
    }
}

/**
 * Install Appium if not present (Windows compatible)
 */
function installAppium() {
    if (!commandExists('appium')) {
        console.log('📦 Installing Appium globally...\n');

        const appiumInstall = executeCommand('npm install -g appium', 'Installing Appium');
        if (appiumInstall) {
            // Use appropriate command for Windows
            const driverCommand = process.platform === 'win32' ?
                'powershell -ExecutionPolicy Bypass -Command "appium driver install uiautomator2"' :
                'appium driver install uiautomator2';

            const driverInstall = executeCommand(driverCommand, 'Installing UiAutomator2 driver');
            if (driverInstall) {
                console.log('✅ Appium installation completed\n');
            }
        } else {
            console.log('❌ Appium installation failed');
            console.log('   Please install manually: npm install -g appium\n');
        }
    } else {
        console.log('✅ Appium is already installed\n');

        // Check if UiAutomator2 driver is installed
        const listCommand = process.platform === 'win32' ?
            'powershell -ExecutionPolicy Bypass -Command "appium driver list"' :
            'appium driver list';
        executeCommand(listCommand, 'Checking installed drivers');
    }
}

/**
 * Create necessary directories
 */
function createDirectories() {
    console.log('📁 Creating necessary directories...\n');
    
    const directories = ['screenshots', 'test-results'];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        } else {
            console.log(`✅ Directory already exists: ${dir}`);
        }
    });
    
    console.log('');
}

/**
 * Verify APK file
 */
function verifyAPK() {
    console.log('📱 Checking APK file...\n');
    
    const apkFile = 'app-dev-release.apk';
    if (fs.existsSync(apkFile)) {
        const stats = fs.statSync(apkFile);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`✅ APK file found: ${apkFile} (${fileSizeMB} MB)`);
        
        // Try to get APK info
        const apkInfo = executeCommand(`aapt dump badging ${apkFile}`, 'Getting APK information');
        if (apkInfo) {
            const packageMatch = apkInfo.match(/package: name='([^']+)'/);
            const versionMatch = apkInfo.match(/versionName='([^']+)'/);
            
            if (packageMatch) console.log(`   Package: ${packageMatch[1]}`);
            if (versionMatch) console.log(`   Version: ${versionMatch[1]}`);
        }
    } else {
        console.log(`⚠️  APK file not found: ${apkFile}`);
        console.log('   Please place your APK file in the project root directory');
        console.log('   Or update the path in wdio.conf.js');
    }
    
    console.log('');
}

/**
 * Test Appium connection (Windows compatible)
 */
function testAppiumConnection() {
    console.log('🔌 Testing Appium connection...\n');

    if (commandExists('appium')) {
        console.log('Starting Appium server for connection test...');

        // Start Appium in background for a quick test
        try {
            const { spawn } = require('child_process');
            const appiumCmd = process.platform === 'win32' ? 'appium.cmd' : 'appium';
            const appiumProcess = spawn(appiumCmd, ['--port', '4723'], {
                stdio: 'ignore',
                detached: true,
                shell: true
            });

            // Wait a moment for server to start
            setTimeout(() => {
                // Test connection using Node.js instead of curl
                testAppiumServerConnection()
                    .then(success => {
                        if (success) {
                            console.log('✅ Appium server is accessible');
                        } else {
                            console.log('⚠️  Could not connect to Appium server');
                        }

                        // Kill the test server
                        try {
                            if (process.platform === 'win32') {
                                execSync(`taskkill /F /PID ${appiumProcess.pid}`, { stdio: 'ignore' });
                            } else {
                                appiumProcess.kill();
                            }
                        } catch (error) {
                            // Ignore kill errors
                        }

                        console.log('');
                        showNextSteps();
                    })
                    .catch(() => {
                        console.log('⚠️  Could not connect to Appium server');
                        console.log('');
                        showNextSteps();
                    });
            }, 3000);

        } catch (error) {
            console.log('⚠️  Could not start Appium server for testing');
            console.log('');
            showNextSteps();
        }
    } else {
        console.log('⚠️  Appium not installed, skipping connection test\n');
        showNextSteps();
    }
}

/**
 * Test Appium server connection using Node.js HTTP
 */
function testAppiumServerConnection() {
    return new Promise((resolve) => {
        const http = require('http');
        const options = {
            hostname: 'localhost',
            port: 4723,
            path: '/wd/hub/status',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

/**
 * Show next steps
 */
function showNextSteps() {
    console.log('🎉 Setup completed! Next steps:\n');
    console.log('1. Ensure your Android device/emulator is running:');
    console.log('   adb devices\n');
    console.log('2. Install project dependencies:');
    console.log('   npm install\n');
    console.log('3. Run the tests:');
    console.log('   npm test\n');
    console.log('4. Or run specific test suites:');
    console.log('   npx wdio wdio.conf.js --spec ./test/specs/app.basic.test.js');
    console.log('   npx wdio wdio.conf.js --spec ./test/specs/app.advanced.test.js\n');
    console.log('📚 For more information, check the README.md file');
    console.log('🐛 If you encounter issues, see the troubleshooting section in README.md\n');
    console.log('Happy testing! 🚀');
}

/**
 * Main setup function
 */
function main() {
    const prerequisitesOK = checkPrerequisites();

    if (!prerequisitesOK) {
        console.log('❌ Some required prerequisites are missing.');
        console.log('Please install the missing components and run setup again.\n');
        console.log('Installation guides:');
        console.log('- Node.js: https://nodejs.org/');
        console.log('- Java: https://adoptopenjdk.net/');
        console.log('- Android SDK: https://developer.android.com/studio');
        if (process.platform === 'win32') {
            console.log('- For Windows: Install Android Studio which includes Android SDK and ADB');
        }
        return;
    }

    checkPowerShellPolicy();
    checkAndroidEnvironment();
    installAppium();
    createDirectories();
    verifyAPK();
    testAppiumConnection();
}

// Run setup
main();
