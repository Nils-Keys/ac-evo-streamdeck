# Baut dist\com.nils.acevo.streamDeckPlugin (Plugin + eingebettetes XL-Profil)
# Aufruf: powershell -ExecutionPolicy Bypass -File build\build.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$repo    = Split-Path $PSScriptRoot -Parent
$pluginSrc = Join-Path $repo 'plugin\com.nils.acevo.sdPlugin'
$profSrc = Join-Path $repo 'profile\AC-Evo-XL.sdProfile'
$dist    = Join-Path $repo 'dist'
$stage   = Join-Path $env:TEMP ('evo-build-' + [guid]::NewGuid().ToString('N'))
$utf8    = New-Object System.Text.UTF8Encoding($false)
$profName = 'AC Evo _ XL'

function New-Zip($srcDir, $topName, $zipPath) {
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  $zip = [IO.Compression.ZipFile]::Open($zipPath, 'Create')
  try {
    $base = (Resolve-Path $srcDir).Path.TrimEnd('\')
    Get-ChildItem $srcDir -Recurse -File | ForEach-Object {
      $rel = $_.FullName.Substring($base.Length + 1).Replace('\', '/')
      [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, "$topName/$rel", 'Optimal')
    }
  } finally { $zip.Dispose() }
}

New-Item -ItemType Directory $stage, $dist -Force | Out-Null

# 1) Profil bereinigen (keine Verweise auf fremde Profile, keine Geraete-ID)
$prof = Join-Path $stage 'AC-Evo-XL.sdProfile'
Copy-Item $profSrc $prof -Recurse
$pm = Get-Content "$prof\manifest.json" -Raw | ConvertFrom-Json
$pm.Device.UUID = ''
$pm | Add-Member InstalledByPluginUUID 'com.nils.acevo' -Force
$pm | Add-Member PreconfiguredName $profName -Force
[IO.File]::WriteAllText("$prof\manifest.json", ($pm | ConvertTo-Json -Depth 8 -Compress), $utf8)
foreach ($dir in Get-ChildItem "$prof\Profiles" -Directory) {
  $mf = Join-Path $dir.FullName 'manifest.json'
  $j = Get-Content $mf -Raw | ConvertFrom-Json
  $a = $j.Controllers[0].Actions
  $drop = @($a.PSObject.Properties | Where-Object { $_.Value.UUID -eq 'com.elgato.streamdeck.profile.rotate' })
  foreach ($d in $drop) {
    $img = $d.Value.States[0].Image
    if ($img) { Remove-Item (Join-Path $dir.FullName $img) -Force -ErrorAction SilentlyContinue }
    $a.PSObject.Properties.Remove($d.Name)
  }
  [IO.File]::WriteAllText($mf, ($j | ConvertTo-Json -Depth 14 -Compress), $utf8)
}

# 1b) Englische Fassung fuer die Verteilung: Hilfe-Kacheln und Seitennamen (die Quelle im Repo bleibt deutsch)
$node = Get-ChildItem "$env:APPDATA\Elgato\StreamDeck\NodeJS" -Recurse -Filter node.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
if (-not $node) { $node = (Get-Command node -ErrorAction Stop).Source }
$en = Join-Path $stage 'help-en'
& $node "$PSScriptRoot\gen-help.js" $en en | Out-Null
$layout = Get-Content "$en\layout.json" -Raw | ConvertFrom-Json
$names = @('Controls', 'Tyres', 'Info', 'Help')
$pm2 = Get-Content "$prof\manifest.json" -Raw | ConvertFrom-Json
for ($i = 0; $i -lt $pm2.Pages.Pages.Count; $i++) {
  $pdir = Join-Path "$prof\Profiles" $pm2.Pages.Pages[$i].ToUpper()
  $mf = Join-Path $pdir 'manifest.json'
  $j = Get-Content $mf -Raw | ConvertFrom-Json
  $j.Name = $names[$i]
  $acts = $j.Controllers[0].Actions
  foreach ($e in $layout) {
    $a = $acts.PSObject.Properties[$e.key]
    if ($a -and $a.Value.UUID -eq 'com.elgato.streamdeck.system.text') { Copy-Item (Join-Path $en $e.file) (Join-Path $pdir $a.Value.States[0].Image) -Force }
  }
  [IO.File]::WriteAllText($mf, ($j | ConvertTo-Json -Depth 14 -Compress), $utf8)
}
# 2) Plugin stagen, Profil einbetten, Manifest ergaenzen
$plug = Join-Path $stage 'com.nils.acevo.sdPlugin'
Copy-Item $pluginSrc $plug -Recurse
Remove-Item "$plug\config.json" -Force -ErrorAction SilentlyContinue
New-Zip $prof (Split-Path $prof -Leaf) (Join-Path $plug "$profName.streamDeckProfile")
$m = Get-Content "$plug\manifest.json" -Raw | ConvertFrom-Json
$m | Add-Member Profiles @(@{ Name = $profName; DeviceType = 2; Readonly = $false; DontAutoSwitchWhenInstalled = $true; AutoInstall = $true }) -Force
[IO.File]::WriteAllText("$plug\manifest.json", ($m | ConvertTo-Json -Depth 8), $utf8)

# 3) Paket schreiben
$out = Join-Path $dist 'com.nils.acevo.streamDeckPlugin'
New-Zip $plug 'com.nils.acevo.sdPlugin' $out
Remove-Item $stage -Recurse -Force
Write-Host ("Paket: {0} ({1:N0} KB)" -f $out, ((Get-Item $out).Length / 1KB))
