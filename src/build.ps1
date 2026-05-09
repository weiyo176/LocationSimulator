# Setup and build LocationSimulator.exe using PyInstaller

if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "LocationSimulator.spec") { Remove-Item -Force "LocationSimulator.spec" }

Write-Host "Building LocationSimulator.exe..."
pyinstaller --noconfirm --log-level=WARN --onefile --console --name "LocationSimulator" --icon "app_icon.ico" --add-data "templates;templates" --add-data "static;static" --collect-all "pytun_pmd3" --collect-all "pymobiledevice3" --copy-metadata "readchar" --copy-metadata "pyimg4" --copy-metadata "pymobiledevice3" --exclude-module "torch" --exclude-module "scipy" --exclude-module "matplotlib" main.py

if (Test-Path "config.json") {
    if (-Not (Test-Path "dist")) { New-Item -ItemType Directory -Force -Path "dist" }
    Copy-Item -Path "config.json" -Destination "dist\config.json" -Force
}

Write-Host "Build complete! Check the 'dist' folder for LocationSimulator.exe"
