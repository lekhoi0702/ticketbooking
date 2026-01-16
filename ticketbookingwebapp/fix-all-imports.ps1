
$srcDir = "c:\Users\khoi.le\Desktop\ticketbooking\ticketbookingwebapp\src"
$files = Get-ChildItem -Path $srcDir -Include "*.jsx", "*.js" -Recurse

$patterns = @(
    'from\s+[''"](?:\.\./?)+services(?:/(.*?))?[''"]',
    'from\s+[''"](?:\.\./?)+context(?:/(.*?))?[''"]',
    'from\s+[''"](?:\.\./?)+theme(?:/(.*?))?[''"]',
    'from\s+[''"](?:\.\./?)+utils(?:/(.*?))?[''"]',
    'from\s+[''"](?:\.\./?)+hooks(?:/(.*?))?[''"]',
    'from\s+[''"](?:\.\./?)+constants(?:/(.*?))?[''"]'
)

$replacements = @(
    "from '@services`$1'",
    "from '@context`$1'",
    "from '@theme`$1'",
    "from '@shared/utils`$1'",
    "from '@shared/hooks`$1'",
    "from '@shared/constants`$1'"
)

# We need to handle the optional capture group correctly.
# If $1 is null or empty, we don't want a trailing slash if the alias already implies one or we want the base.
# But wait, @services is path.resolve(__dirname, './src/services').
# So '@services/api' is correct.
# If the original was '.../services', $1 is empty. Replacement should be '@services'.
# If original was '.../services/api', $1 is '/api'. Replacement should be '@services/api'.

foreach ($file in $files) {
    if ($file.Name -eq "vite.config.js") { continue }
    
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $modified = $false
    
    for ($i = 0; $i -lt $patterns.Count; $i++) {
        $pattern = $patterns[$i]
        $replacement = $replacements[$i]
        
        if ($content -match $pattern) {
            $content = [regex]::Replace($content, $pattern, $replacement)
            $modified = $true
        }
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}
