#!/usr/bin/env pwsh
# Start FastAPI backend on 0.0.0.0:8080 with a fallback SECRET_KEY for local development
if (-not $env:SECRET_KEY) {
  $env:SECRET_KEY = 'dev_secret'
  Write-Host "SECRET_KEY not set; using default 'dev_secret' (DO NOT use in production)"
}

Write-Host 'Starting backend on 0.0.0.0:8080'
uvicorn Backend.Authorization.Register:app --host 0.0.0.0 --port 8080
