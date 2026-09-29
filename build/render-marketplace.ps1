# Rendert die HTML-Kompositionen mit Edge (headless) zu PNG. Aufruf: powershell -ExecutionPolicy Bypass -File build\render-marketplace.ps1
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$edge = @("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", "C:\Program Files\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'Microsoft Edge nicht gefunden' }
$node = Get-ChildItem "$env:APPDATA\Elgato\StreamDeck\NodeJS" -Recurse -Filter node.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if (-not $node) { $node = (Get-Command node -ErrorAction Stop).Source }

$html = Join-Path $env:TEMP 'evo-marketplace-html'
$png  = Join-Path $repo 'marketplace'
New-Item -ItemType Directory $html, $png -Force | Out-Null
& $node "$PSScriptRoot\gen-marketplace.js" $html

function Shot($file, $out, $w, $h) {
  & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size="$w,$h" "--screenshot=$out" ("file:///" + $file.Replace('\', '/')) 2>$null
  $t = 0; while (-not (Test-Path $out) -and $t -lt 40) { Start-Sleep -Milliseconds 250; $t++ }
}
foreach ($n in 'thumbnail', 'gallery-1', 'gallery-2', 'gallery-3', 'gallery-4') {
  $o = Join-Path $png "$n.png"
  if (Test-Path $o) { [IO.File]::Delete($o) }
  Shot (Join-Path $html "$n.html") $o 1920 960
  $b = [IO.File]::ReadAllBytes($o)
  $wpx = ($b[16] * 16777216) + ($b[17] * 65536) + ($b[18] * 256) + $b[19]; $hpx = ($b[20] * 16777216) + ($b[21] * 65536) + ($b[22] * 256) + $b[23]
  Write-Host ("{0}.png {1}x{2} ({3:N0} KB)" -f $n, $wpx, $hpx, ($b.Length / 1KB))
}
