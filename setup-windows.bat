@echo off
echo 🚀 Windows Environment Setup for APK Automation Testing
echo ========================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running with administrator privileges
) else (
    echo ⚠️  Not running as administrator - some operations may fail
    echo    Consider running as administrator for full setup
)
echo.

REM Check PowerShell execution policy
echo 🔒 Checking PowerShell execution policy...
for /f "tokens=*" %%i in ('powershell -Command "Get-ExecutionPolicy"') do set POLICY=%%i
echo Current policy: %POLICY%

if "%POLICY%"=="Restricted" (
    echo ⚠️  PowerShell execution policy is Restricted
    echo    This will prevent Appium from running properly
    echo    Attempting to set policy to RemoteSigned for current user...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    if %errorLevel% == 0 (
        echo ✅ PowerShell execution policy updated
    ) else (
        echo ❌ Failed to update PowerShell execution policy
        echo    Please run manually: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    )
) else (
    echo ✅ PowerShell execution policy is acceptable
)
echo.

REM Check for Android SDK
echo 📱 Checking for Android SDK...
set ANDROID_FOUND=0

if defined ANDROID_HOME (
    echo ✅ ANDROID_HOME is set: %ANDROID_HOME%
    set ANDROID_FOUND=1
) else if defined ANDROID_SDK_ROOT (
    echo ✅ ANDROID_SDK_ROOT is set: %ANDROID_SDK_ROOT%
    set ANDROID_HOME=%ANDROID_SDK_ROOT%
    set ANDROID_FOUND=1
) else (
    REM Check common locations
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        echo ✅ Android SDK found at: %LOCALAPPDATA%\Android\Sdk
        set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
        set ANDROID_FOUND=1
    ) else if exist "C:\Android\Sdk" (
        echo ✅ Android SDK found at: C:\Android\Sdk
        set ANDROID_HOME=C:\Android\Sdk
        set ANDROID_FOUND=1
    ) else (
        echo ❌ Android SDK not found
        echo    Please install Android Studio or Android SDK
        echo    Common locations:
        echo    - %LOCALAPPDATA%\Android\Sdk
        echo    - C:\Android\Sdk
    )
)

if %ANDROID_FOUND%==1 (
    REM Check for ADB
    if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        echo ✅ ADB found at: %ANDROID_HOME%\platform-tools\adb.exe
        
        REM Add to PATH for current session
        set PATH=%ANDROID_HOME%\platform-tools;%PATH%
        echo ✅ Added ADB to PATH for current session
        
        REM Test ADB
        echo 🔍 Testing ADB connection...
        adb devices
    ) else (
        echo ❌ ADB not found in Android SDK platform-tools
        echo    Please ensure Android SDK Platform-Tools are installed
    )
)
echo.

REM Check Java
echo ☕ Checking Java installation...
java -version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Java is installed
    java -version
) else (
    echo ❌ Java is not installed
    echo    Please install Java JDK 8 or higher
    echo    Download from: https://adoptopenjdk.net/
)
echo.

REM Check Node.js
echo 📦 Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js is installed
    node --version
) else (
    echo ❌ Node.js is not installed
    echo    Please install Node.js from: https://nodejs.org/
)
echo.

REM Install Appium if Node.js is available
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo 🔧 Checking Appium installation...
    appium --version >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Appium is already installed
        appium --version
    ) else (
        echo 📦 Installing Appium globally...
        npm install -g appium
        if %errorLevel% == 0 (
            echo ✅ Appium installed successfully
            echo 🔧 Installing UiAutomator2 driver...
            appium driver install uiautomator2
            if %errorLevel% == 0 (
                echo ✅ UiAutomator2 driver installed successfully
            ) else (
                echo ⚠️  UiAutomator2 driver installation failed
            )
        ) else (
            echo ❌ Appium installation failed
        )
    )
)
echo.

echo 🎉 Windows setup completed!
echo.
echo 📋 Next steps:
echo 1. Ensure your Android device/emulator is running
echo 2. Run: adb devices (to verify device connection)
echo 3. Run: node setup.js (to run the full setup check)
echo 4. Run: npm test (to start testing)
echo.
echo 💡 Tips:
echo - If ADB is not found, restart your command prompt after setting ANDROID_HOME
echo - For persistent PATH changes, add %ANDROID_HOME%\platform-tools to your system PATH
echo - If Appium commands fail, try running with: powershell -ExecutionPolicy Bypass -Command "appium --version"
echo.
pause
