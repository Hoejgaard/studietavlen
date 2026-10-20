# Udtrækker ren tekst fra alle .docx og .pptx under -Root og gemmer én .txt pr. fil i -OutDir.
# Brug:  .\tools\extract-office.ps1 -Root .\raw -OutDir .\.cache\extract
param(
    [Parameter(Mandatory=$true)][string]$Root,
    [Parameter(Mandatory=$true)][string]$OutDir
)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$Root = (Resolve-Path $Root).Path
New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

function Get-XmlText {
    param([string]$xml, [string]$paraTag, [string]$textTag)
    $paras = [regex]::Matches($xml, "<$paraTag[ >].*?</$paraTag>", 'Singleline')
    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($p in $paras) {
        $runs = [regex]::Matches($p.Value, "<$textTag(?: [^>]*)?>(.*?)</$textTag>", 'Singleline')
        $sb = New-Object System.Text.StringBuilder
        foreach ($r in $runs) { [void]$sb.Append($r.Groups[1].Value) }
        $t = [System.Net.WebUtility]::HtmlDecode($sb.ToString()).Trim()
        if ($t) { $lines.Add($t) }
    }
    return ($lines -join "`n")
}

$files = Get-ChildItem -Recurse -File $Root | Where-Object { $_.Extension -in '.docx','.pptx' }
foreach ($f in $files) {
    $rel = $f.FullName.Substring($Root.Length).TrimStart('\')
    $outName = ($rel -replace '[\\/]', '__') + '.txt'
    $outPath = Join-Path $OutDir $outName
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($f.FullName)
        $out = New-Object System.Text.StringBuilder
        [void]$out.AppendLine("### KILDE: raw\$rel")
        if ($f.Extension -eq '.docx') {
            $entry = $zip.GetEntry('word/document.xml')
            $sr = New-Object System.IO.StreamReader($entry.Open())
            $xml = $sr.ReadToEnd(); $sr.Close()
            [void]$out.AppendLine((Get-XmlText $xml 'w:p' 'w:t'))
        } else {
            $slides = $zip.Entries | Where-Object { $_.FullName -match '^ppt/slides/slide(\d+)\.xml$' } |
                Sort-Object { [int]([regex]::Match($_.FullName, 'slide(\d+)\.xml').Groups[1].Value) }
            $n = 0
            foreach ($s in $slides) {
                $n++
                $sr = New-Object System.IO.StreamReader($s.Open())
                $xml = $sr.ReadToEnd(); $sr.Close()
                [void]$out.AppendLine("")
                [void]$out.AppendLine("--- Slide $n ---")
                [void]$out.AppendLine((Get-XmlText $xml 'a:p' 'a:t'))
                $num = [regex]::Match($s.FullName, 'slide(\d+)\.xml').Groups[1].Value
                $note = $zip.GetEntry("ppt/notesSlides/notesSlide$num.xml")
                if ($note) {
                    $sr = New-Object System.IO.StreamReader($note.Open())
                    $nx = $sr.ReadToEnd(); $sr.Close()
                    $nt = Get-XmlText $nx 'a:p' 'a:t'
                    if ($nt -and $nt -notmatch '^\d+$') { [void]$out.AppendLine("[Noter: $nt]") }
                }
            }
        }
        $zip.Dispose()
        [System.IO.File]::WriteAllText($outPath, $out.ToString(), [System.Text.Encoding]::UTF8)
        Write-Output ("OK   {0,-70} {1,8} tegn" -f $rel, $out.Length)
    } catch {
        Write-Output "FEJL $rel : $($_.Exception.Message)"
    }
}
