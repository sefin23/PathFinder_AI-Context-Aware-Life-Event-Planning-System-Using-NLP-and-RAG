$filePath = 'c:\Users\sefin\OneDrive\Desktop\Pathfinder_AI\frontend-v2\src\components\WorkflowCard.jsx'
$content = Get-Content $filePath
$newContent = @()
for ($i = 0; $i -lt $content.Count; $i++) {
    if ($i -eq 854) { # Line 855 zero-indexed
        if ($content[$i] -match '</button>') {
            continue
        }
    }
    $newContent += $content[$i]
}
$newContent | Set-Content $filePath -Encoding UTF8
