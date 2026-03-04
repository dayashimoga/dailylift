# verify_all.ps1
# Fully automated verification script for all projects

$ErrorActionPreference = "Stop"

function Run-ExternalCommand {
    param([string]$Command, [string]$Arguments)
    Write-Host "Running: $Command $Arguments" -ForegroundColor Gray
    & $Command $Arguments.Split(" ")
    if ($LASTEXITCODE -ne 0) {
        throw "Command '$Command $Arguments' failed with exit code $LASTEXITCODE"
    }
}

Write-Host "🚀 Starting full project verification..." -ForegroundColor Cyan

# 1. boringwebsite (Node.js via Docker)
Write-Host "`n📦 Verifying boringwebsite via Docker..." -ForegroundColor Magenta
pushd "H:\boringwebsite"
try {
    Write-Host "Building Docker image for boringwebsite..."
    Run-ExternalCommand "docker" "build -t boringwebsite-test ."
    Write-Host "Running tests in Docker..."
    Run-ExternalCommand "docker" "run --rm boringwebsite-test npm run test:coverage"
    Write-Host "✅ boringwebsite verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ boringwebsite verification failed: $_" -ForegroundColor Red
    exit 1
} finally {
    popd
}

# 2. dailyfacts (Node.js via Docker)
Write-Host "`n📦 Verifying dailyfacts via Docker..." -ForegroundColor Magenta
pushd "H:\boring\projects\dailyfacts"
try {
    Write-Host "Building Docker image for dailyfacts (test stage)..."
    $dockerfileTest = @"
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "test:coverage"]
"@
    $dockerfileTest | Out-File -FilePath "Dockerfile.test" -Encoding UTF8
    
    Run-ExternalCommand "docker" "build -t dailyfacts-test -f Dockerfile.test ."
    Write-Host "Running tests in Docker..."
    Run-ExternalCommand "docker" "run --rm dailyfacts-test npm run test:coverage"
    Write-Host "✅ dailyfacts verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ dailyfacts verification failed: $_" -ForegroundColor Red
    exit 1
} finally {
    if (Test-Path "Dockerfile.test") { Remove-Item "Dockerfile.test" }
    popd
}

# 3. boring (Python via Temp Venv)
Write-Host "`n🐍 Verifying boring (Python) via temporary venv..." -ForegroundColor Magenta
pushd "H:\boring"
try {
    Write-Host "Creating temporary virtual environment..."
    Run-ExternalCommand "python" "-m venv temp_venv"
    
    Write-Host "Activating venv and installing dependencies..."
    # We use cmd /c because of PowerShell activation peculiarities in some environments
    $installCmd = ".\temp_venv\Scripts\python.exe -m pip install --upgrade pip && " +
                  ".\temp_venv\Scripts\pip.exe install pytest pytest-cov pytest-asyncio aiohttp jinja2"
    if (Test-Path "requirements.txt") {
        $installCmd += " && .\temp_venv\Scripts\pip.exe install -r requirements.txt"
    }
    Run-ExternalCommand "cmd" "/c $installCmd"
    
    Write-Host "Running pytest with coverage..."
    Run-ExternalCommand ".\temp_venv\Scripts\pytest.exe" "tests/ --cov=scripts --cov-report=term"
    
    Write-Host "✅ boring (Python) verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ boring (Python) verification failed: $_" -ForegroundColor Red
    exit 1
} finally {
    if (Test-Path "temp_venv") {
        Write-Host "Removing temporary venv..."
        Remove-Item -Recurse -Force temp_venv
    }
    popd
}

Write-Host "`n🎉 All projects verified successfully!" -ForegroundColor Green
