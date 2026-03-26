# 🛡️ Script de Réparation UTF-8 (Hex-based) - Job Hunter Elite

$files = Get-ChildItem -Path . -Recurse -Include *.md, *.ts, *.tsx, *.js, *.json, *.sql, *.txt
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Définition des paires Mojibake -> Correct
$fixes = @{
    ([char]0xC3 + [char]0xA9) = [char]0xE9 # é
    ([char]0xC3 + [char]0xA8) = [char]0xE8 # è
    ([char]0xC3 + [char]0xA0) = [char]0xE0 # à
    ([char]0xC3 + [char]0xA7) = [char]0xE7 # ç
    ([char]0xC3 + [char]0xB4) = [char]0xF4 # ô
    ([char]0xC3 + [char]0xAA) = [char]0xEA # ê
    ([char]0xC3 + [char]0xBB) = [char]0xFB # û
    ([char]0xC3 + [char]0xAE) = [char]0xEE # î
    ([char]0xC3 + [char]0xAF) = [char]0xEF # ï
    ([char]0xC3 + [char]0xB9) = [char]0xF9 # ù
    ([char]0xC3 + [char]0xAB) = [char]0xEB # ë
    ([char]0xC3 + [char]0x80) = [char]0xC0 # À
    ([char]0xC3 + [char]0x89) = [char]0xC9 # É
    ([char]0xC3 + [char]0x88) = [char]0xC8 # È
    ([char]0xC3 + [char]0x82) = [char]0xC2 # Â
    ([char]0xC3 + [char]0x94) = [char]0xD4 # Ô
    ([char]0xC3 + [char]0x20) = [char]0xE0 # à (cas espace)
}

foreach ($file in $files) {
    if ($file.FullName -match "\\.git\\") { continue }
    
    $rawBytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $content = [System.Text.Encoding]::UTF8.GetString($rawBytes)
    
    # Appliquer les corrections
    foreach ($key in $fixes.Keys) {
        $content = $content.Replace($key, $fixes[$key])
    }
    
    # Sauvegarder proprement
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
}

Write-Host "✅ Encodage réparé avec succès."
