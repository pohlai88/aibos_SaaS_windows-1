# Compare file hashes between accounting-sdk and ledger-sdk service files
$accDir = "packages/accounting-sdk/src/services"
$ledgerDir = "packages/ledger-sdk/src/services"
$accFiles = Get-ChildItem $accDir -Filter *.ts
$log = @()
foreach ($file in $accFiles) {
    $ledgerFile = Join-Path $ledgerDir $file.Name
    if (Test-Path $ledgerFile) {
        $accHash = (Get-FileHash $file.FullName).Hash
        $ledgerHash = (Get-FileHash $ledgerFile).Hash
        if ($accHash -eq $ledgerHash) {
            $log += "$($file.Name): IDENTICAL"
        } else {
            $log += "$($file.Name): DIFFERENT"
        }
    } else {
        $log += "$($file.Name): ONLY IN ACCOUNTING-SDK"
    }
}
$ledgerFiles = Get-ChildItem $ledgerDir -Filter *.ts
foreach ($file in $ledgerFiles) {
    $accFile = Join-Path $accDir $file.Name
    if (-not (Test-Path $accFile)) {
        $log += "$($file.Name): ONLY IN LEDGER-SDK"
    }
}
$log | Set-Content duplication-audit.log 