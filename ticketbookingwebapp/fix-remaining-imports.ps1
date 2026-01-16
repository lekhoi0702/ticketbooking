# Script để fix các imports còn sót lại

$replacements = @{
    # Fix relative imports within features
    "from '../../pages/admin/"          = "from '../pages/"
    "from '../../pages/organizer/"      = "from '../pages/"
    "from '../../pages/user/"           = "from '../pages/"
    "from '../../components/Admin/"     = "from '../components/"
    "from '../../components/Organizer/" = "from '../components/"
    "from '../../components/Customer/"  = "from '../components/"
    
    # Fix imports from old structure
    'from "../../pages/admin/'          = 'from "../pages/'
    'from "../../pages/organizer/'      = 'from "../pages/'
    'from "../../pages/user/'           = 'from "../pages/'
    'from "../../components/Admin/'     = 'from "../components/'
    'from "../../components/Organizer/' = 'from "../components/'
    'from "../../components/Customer/'  = 'from "../components/'
}

# Get all JSX and JS files in features folder
$files = Get-ChildItem -Path "src\features" -Include "*.jsx", "*.js" -Recurse

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $replacements.Keys) {
        if ($content -match [regex]::Escape($old)) {
            $content = $content -replace [regex]::Escape($old), $replacements[$old]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host "`n✅ Total files fixed: $totalFixed" -ForegroundColor Cyan
