$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $root 'build\itch'
$zip = Join-Path $root 'build\DiseaseDestroyer-itch.zip'
if (Test-Path $out) { Remove-Item -LiteralPath $out -Recurse -Force }
New-Item -ItemType Directory -Path $out -Force | Out-Null
Copy-Item (Join-Path $root 'web\*') $out
$materials = Join-Path $root 'Assets\Disease Destroyer Assets\Materials'
$sounds = Join-Path $root 'Assets\Disease Destroyer Assets\Sounds'
@('background.jpg','player.jpg','virus.jpg','cell1.jpg','cell2.jpg','cell3.jpg','splashScreen.png','introcard1.jpg','pauseScreenNew.png','winScreen.jpg','loseScreen.jpg') | ForEach-Object {
  Copy-Item -LiteralPath (Join-Path $materials $_) -Destination $out
}
@('shoot.wav','push.wav','boom.wav','virusSplat.wav','cellSplat.wav','corrupt.wav','win.wav','lose.wav') | ForEach-Object {
  Copy-Item -LiteralPath (Join-Path $sounds $_) -Destination $out
}
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -Path (Join-Path $out '*') -DestinationPath $zip -CompressionLevel Optimal
Write-Host "itch.io package: $zip"
