# Libera el puerto 3000 (solo procesos Node), quita lock de Turbopack y arranca Next.
$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$pids = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($procId in $pids) {
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    if ($null -ne $p -and $p.ProcessName -eq 'node') {
        Write-Host "Cerrando Node (PID $procId) que usa el puerto 3000..."
        Stop-Process -Id $procId -Force
    }
}

$lockDir = Join-Path $root '.next\dev'
if (Test-Path $lockDir) {
    Write-Host 'Eliminando .next\dev (caché / lock de desarrollo)...'
    Remove-Item -Recurse -Force $lockDir
}

Write-Host 'Iniciando npm run dev...'
npm run dev
