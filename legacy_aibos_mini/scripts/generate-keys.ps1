# Generate encryption keys using PowerShell
function Generate-EncryptionKey {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    return [System.Convert]::ToHexString($bytes)
}

# Generate keys
$governanceKey = Generate-EncryptionKey
$databaseKey = Generate-EncryptionKey
$auditKey = Generate-EncryptionKey
$jwtSecret = Generate-EncryptionKey -Length 64

Write-Host "Generated Encryption Keys:"
Write-Host "========================"
Write-Host "GOVERNANCE_ENCRYPTION_KEY=$governanceKey"
Write-Host "DATABASE_ENCRYPTION_KEY=$databaseKey"
Write-Host "AUDIT_LOG_ENCRYPTION_KEY=$auditKey"
Write-Host "JWT_SECRET=$jwtSecret"

# Save to file
$envContent = @"
GOVERNANCE_ENCRYPTION_KEY=$governanceKey
DATABASE_ENCRYPTION_KEY=$databaseKey
AUDIT_LOG_ENCRYPTION_KEY=$auditKey
JWT_SECRET=$jwtSecret
"@

$envContent | Out-File -FilePath ".env.local.generated" -Encoding UTF8
Write-Host "`n✅ Keys saved to .env.local.generated"