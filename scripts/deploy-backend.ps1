# deploy-backend.ps1
# Runs ON the Windows VM via: az vm run-command invoke --command-id RunPowerShellScript
# Parameters passed by CI: ArtifactUrl, Sha

param(
    [Parameter(Mandatory)][string]$ArtifactUrl,
    [Parameter(Mandatory)][string]$Sha
)

$ErrorActionPreference = 'Stop'
$appDir   = 'C:\inetpub\ecomm-backend'
$zipPath  = "$env:TEMP\backend-$Sha.zip"
$siteName = 'ecomm-backend'

Write-Host "==> Deploying backend artifact: $Sha"

# Stop IIS site so files can be replaced
Write-Host "==> Stopping IIS site '$siteName'..."
Import-Module WebAdministration -ErrorAction SilentlyContinue
Stop-Website -Name $siteName -ErrorAction SilentlyContinue

# Download artifact from Blob Storage (SAS token is embedded in the URL)
Write-Host "==> Downloading artifact..."
Invoke-WebRequest -Uri $ArtifactUrl -OutFile $zipPath -UseBasicParsing

# Expand into app directory (overwrite existing files)
Write-Host "==> Expanding archive to $appDir..."
if (-not (Test-Path $appDir)) { New-Item -ItemType Directory -Path $appDir -Force | Out-Null }
Expand-Archive -Path $zipPath -DestinationPath $appDir -Force

# Copy web.config if not present (required by iisnode)
$webConfig = Join-Path $appDir 'web.config'
if (-not (Test-Path $webConfig)) {
    Write-Host "==> Writing default web.config for iisnode..."
    @'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="src/index.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="API">
          <match url="/*" />
          <action type="Rewrite" url="src/index.js" />
        </rule>
      </rules>
    </rewrite>
    <iisnode node_env="production" />
  </system.webServer>
</configuration>
'@ | Set-Content $webConfig -Encoding UTF8
}

# Install production dependencies
Write-Host "==> Running npm ci --omit=dev..."
Set-Location $appDir
$npmResult = & npm ci --omit=dev 2>&1
Write-Host $npmResult
if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

# Clean up zip
Remove-Item $zipPath -ErrorAction SilentlyContinue

# Start IIS site
Write-Host "==> Starting IIS site '$siteName'..."
Start-Website -Name $siteName

Write-Host "==> Backend deployment complete. SHA: $Sha"
