$csvPath = Join-Path $PSScriptRoot '../Databases/Items.csv'
$outPath = Join-Path $PSScriptRoot '../Docs/Item_List.html'

function Escape-Html([string]$text) {
    if ($null -eq $text) { return '' }
    return [System.Net.WebUtility]::HtmlEncode($text)
}

function Infer-Pocket([int]$id, [string]$name, [string]$csvPocket) {
    if ($csvPocket -and $csvPocket.Trim().Length -gt 0) {
        return $csvPocket.Trim()
    }

    if ($name -eq 'None') { return 'General' }
    if ($name -like 'Dummy*') { return 'Unused' }

    if ($id -ge 63 -and $id -le 137) { return 'Remedies' }
    if ($id -ge 138 -and $id -le 161) { return 'Pokeballs' }
    if ($id -ge 162 -and $id -le 261) { return 'Machines' }
    if ($id -ge 262 -and $id -le 325) { return 'Berries' }
    if ($id -ge 326 -and $id -le 333) { return 'Battle Items' }
    if (($id -ge 334 -and $id -le 417) -or ($id -ge 452 -and $id -le 485)) { return 'Held Items' }
    if ($id -ge 418 -and $id -le 451) { return 'Valuables' }
    if ($id -ge 505 -and $id -le 537) { return 'Key Items' }
    if ($id -ge 538) { return 'Unused' }

    return 'General'
}

$rows = @()
Get-Content -Path $csvPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line) { return }

    $parts = $line -split ',', 5
    if ($parts.Count -lt 2) { return }

    $idRaw = $parts[0].Trim()
    if (-not ($idRaw -match '^\d+$')) { return }

    $name = $parts[1].Trim()
    $csvPocket = if ($parts.Count -ge 3) { $parts[2].Trim() } else { '' }
    $notes = if ($parts.Count -ge 4) { $parts[3].Trim() } else { '' }

    $rows += [pscustomobject]@{
        IdRaw = $idRaw
        IdInt = [int]$idRaw
        Name = $name
        CsvPocket = $csvPocket
        Notes = $notes
    }
}

$sectionOrder = @(
    'General',
    'Remedies',
    'Pokeballs',
    'Machines',
    'Berries',
    'Battle Items',
    'Held Items',
    'Valuables',
    'Key Items',
    'Unused'
)

$grouped = [ordered]@{}
foreach ($s in $sectionOrder) {
    $grouped[$s] = New-Object System.Collections.Generic.List[object]
}

foreach ($row in $rows) {
    $pocket = Infer-Pocket -id $row.IdInt -name $row.Name -csvPocket $row.CsvPocket
    if (-not $grouped.Contains($pocket)) {
        $grouped[$pocket] = New-Object System.Collections.Generic.List[object]
    }
    $grouped[$pocket].Add($row)
}

$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine('<!DOCTYPE html>')
[void]$sb.AppendLine('<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">')
[void]$sb.AppendLine('<title>Item List</title><link rel="stylesheet" href="../src/Styles/Style.css">')
[void]$sb.AppendLine('<meta name="wiki-tags" content="docs, items, database, pockets">')
[void]$sb.AppendLine('<meta name="wiki-category" content="Docs">')
[void]$sb.AppendLine('<meta name="wiki-updated" content="2026-04-17">')
[void]$sb.AppendLine('</head>')
[void]$sb.AppendLine('<body>')
[void]$sb.AppendLine('<div class="container">')
[void]$sb.AppendLine('<nav class="breadcrumb"><a href="../index.html">Home</a><span class="sep">?</span> Docs <span class="sep">?</span> Item List</nav>')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('<h1>Item List</h1>')
[void]$sb.AppendLine('<p class="item-list-intro">This page is generated from <b>Databases/Items.csv</b>. Update the CSV to edit item names, pocket assignment, and notes.</p>')
[void]$sb.AppendLine('<p class="item-list-meta">CSV columns used: <b>ID</b>, <b>NAME</b>, optional <b>POCKET</b>, optional <b>NOTES</b>.</p>')

foreach ($section in $grouped.Keys) {
    $items = $grouped[$section]
    if ($items.Count -eq 0) { continue }

    $sectionSafe = Escape-Html $section
    [void]$sb.AppendLine('')
    [void]$sb.AppendLine("<h2>$sectionSafe</h2>")
    [void]$sb.AppendLine('<div class="tcontainer"><table class="items-table item-pocket-table round red border-bold">')
    [void]$sb.AppendLine('<tr><th class="item-id-h">ID</th><th class="item-icon-h">Icon</th><th class="item-name-h">Name</th><th class="item-notes-h">Notes</th></tr>')

    foreach ($item in $items) {
        $idDisplay = $item.IdRaw.PadLeft(3, '0')
        $idImg = $item.IdInt
        $nameSafe = Escape-Html $item.Name
        $notesSafe = Escape-Html $item.Notes

        $rowHtml = '<tr><td class="item-id">{0}</td><td class="icon"><img loading="lazy" src="../src/Item/{1}.png" alt="{2}" class="sprite-small" onerror="this.replaceWith(document.createTextNode(''-''))"></td><td class="name">{2}</td><td class="item-notes">{3}</td></tr>' -f $idDisplay, $idImg, $nameSafe, $notesSafe
        [void]$sb.AppendLine($rowHtml)
    }

    [void]$sb.AppendLine('</table></div>')
}

[void]$sb.AppendLine('')
[void]$sb.AppendLine('</div>')
[void]$sb.AppendLine('<script src="../src/wiki-data.js"></script>')
[void]$sb.AppendLine('<script src="../src/wiki.js"></script>')
[void]$sb.AppendLine('</body></html>')

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), $utf8NoBom)
Write-Output "Generated Item_List.html from Items.csv with $($rows.Count) rows."
