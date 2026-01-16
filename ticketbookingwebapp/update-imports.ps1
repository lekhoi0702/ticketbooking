# Script để update import paths sau khi tái cấu trúc

$replacements = @{
    # Admin imports
    "from '../../components/Admin/"     = "from '@features/admin/components/"
    "from '../components/Admin/"        = "from '@features/admin/components/"
    "from './components/Admin/"         = "from '@features/admin/components/"
    
    # Organizer imports  
    "from '../../components/Organizer/" = "from '@features/organizer/components/"
    "from '../components/Organizer/"    = "from '@features/organizer/components/"
    
    # User/Customer imports
    "from '../../components/Customer/"  = "from '@features/user/components/"
    "from '../components/Customer/"     = "from '@features/user/components/"
    "from '../../components/Event/"     = "from '@features/user/components/Event/"
    
    # Shared imports
    "from '../../hooks/"                = "from '@shared/hooks/"
    "from '../hooks/"                   = "from '@shared/hooks/"
    "from '../../utils/"                = "from '@shared/utils/"
    "from '../utils/"                   = "from '@shared/utils/"
    "from '../../constants/"            = "from '@shared/constants/"
    "from '../constants/"               = "from '@shared/constants/"
    
    # Services
    "from '../../services/"             = "from '@services/"
    "from '../services/"                = "from '@services/"
    
    # Context
    "from '../../context/"              = "from '@context/"
    "from '../context/"                 = "from '@context/"
    
    # Theme
    "from '../../theme/"                = "from '@theme/"
    "from '../theme/"                   = "from '@theme/"
}

# Get all JSX files in features folder
$files = Get-ChildItem -Path "src\features" -Filter "*.jsx" -Recurse

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
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "`nImport paths updated successfully!"
