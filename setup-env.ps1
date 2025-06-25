# Windows Environment Setup for APK Automation Testing
Write-Host "🚀 Setting up Windows environment for APK Automation Testing" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green
Write-Host ""

# Set Android SDK path
$AndroidSdkPath = "C:\Users\subiv\AppData\Local\Android\Sdk"
if (Test-Path $AndroidSdkPath) {
    $env:ANDROID_HOME = $AndroidSdkPath
    $env:ANDROID_SDK_ROOT = $AndroidSdkPath
    Write-Host "✅ ANDROID_HOME set to: $AndroidSdkPath" -ForegroundColor Green
    
    # Add platform-tools to PATH
    $PlatformToolsPath = Join-Path $AndroidSdkPath "platform-tools"
    if (Test-Path $PlatformToolsPath) {
        $env:PATH += ";$PlatformToolsPath"
        Write-Host "✅ Added platform-tools to PATH" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Android SDK not found at expected location" -ForegroundColor Red
    Write-Host "   Please install Android Studio or set correct path" -ForegroundColor Yellow
}

Write-Host ""

# Test ADB
Write-Host "🔍 Testing ADB connection..." -ForegroundColor Cyan
try {
    $adbOutput = & adb devices 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ADB is working" -ForegroundColor Green
        Write-Host $adbOutput
    } else {
        Write-Host "❌ ADB test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ADB not found or not working" -ForegroundColor Red
}

Write-Host ""

# Test Appium
Write-Host "🔍 Testing Appium..." -ForegroundColor Cyan
try {
    $appiumVersion = & appium --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Appium is working - Version: $appiumVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Appium test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Appium not found or not working" -ForegroundColor Red
}

Write-Host ""

# Check drivers
Write-Host "🔍 Checking Appium drivers..." -ForegroundColor Cyan
try {
    $driverOutput = & appium driver list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Appium drivers:" -ForegroundColor Green
        Write-Host $driverOutput
    } else {
        Write-Host "❌ Failed to list Appium drivers" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to check Appium drivers" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Environment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 You can now run:" -ForegroundColor Cyan
Write-Host "   node setup.js     - Run full setup check" -ForegroundColor White
Write-Host "   npm test          - Run all tests" -ForegroundColor White
Write-Host "   npm run test:basic - Run basic tests" -ForegroundColor White
Write-Host ""
