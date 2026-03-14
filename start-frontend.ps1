#!/usr/bin/env pwsh
# Serve frontend statically on 0.0.0.0:3000 (use a different port than backend)
Set-Location -Path (Join-Path $PSScriptRoot 'frontend')
Write-Host 'Starting static frontend server on 0.0.0.0:3000'
python -m http.server 3000 --bind 0.0.0.0
