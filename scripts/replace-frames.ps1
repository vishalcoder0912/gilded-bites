param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $ZipPath)) {
  throw "Frame zip not found: $ZipPath"
}

$projectRoot = Get-Location
$framesDir = Join-Path $projectRoot "public\Frames"
$tempDir = Join-Path $projectRoot "public\_frames_extract_temp"

Remove-Item -Recurse -Force $framesDir -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $framesDir | Out-Null
New-Item -ItemType Directory -Force $tempDir | Out-Null

Expand-Archive -LiteralPath $ZipPath -DestinationPath $tempDir -Force

Get-ChildItem -Path $tempDir -Recurse -Filter "ezgif-frame-*.jpg" | Sort-Object Name | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $framesDir $_.Name) -Force
}

Remove-Item -Recurse -Force $tempDir

$count = (Get-ChildItem -Path $framesDir -Filter "ezgif-frame-*.jpg").Count
Write-Host "Copied $count frames to public\Frames"

if ($count -ne 240) {
  Write-Warning "Expected 240 frames, but found $count. Check your ZIP file."
}
