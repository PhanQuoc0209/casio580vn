$desktop = [Environment]::GetFolderPath('Desktop')
$targetBat = Join-Path $PSScriptRoot 'Chay_Casio_580VN.bat'
$shortcutPath = Join-Path $desktop 'Casio fx-580VN X.lnk'

$wscript = New-Object -ComObject WScript.Shell
$shortcut = $wscript.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetBat
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = 'May tinh Casio fx-580VN X Emulator'
$shortcut.Save()

Write-Host "Da tao thanh cong Shortcut tai: $shortcutPath" -ForegroundColor Green
