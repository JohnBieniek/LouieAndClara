$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$unity = 'C:\Program Files\Unity\Hub\Editor\6000.3.18f1\Editor\Unity.exe'
$output = Join-Path $root 'build\WebGL'
$zip = Join-Path $root 'build\DiseaseDestroyer-WebGL-itch.zip'
$log = Join-Path $root 'build\unity-webgl.log'

if (!(Test-Path $unity)) { throw "Unity 6000.3.18f1 was not found at $unity" }
& $unity -batchmode -quit -projectPath $root -executeMethod DiseaseDestroyerBuild.BuildWebGL -logFile $log
if ($LASTEXITCODE -ne 0) { throw "Unity WebGL build failed. See $log" }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path $zip) { Remove-Item -LiteralPath $zip -Force }
$stream = [IO.File]::Open($zip, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $output -Recurse -File | ForEach-Object {
        $name = $_.FullName.Substring($output.Length + 1).Replace('\', '/')
        $entry = $archive.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
        $input = $_.OpenRead()
        $target = $entry.Open()
        try { $input.CopyTo($target) } finally { $target.Dispose(); $input.Dispose() }
    }
} finally {
    $archive.Dispose()
    $stream.Dispose()
}
Write-Host "itch.io package: $zip"
