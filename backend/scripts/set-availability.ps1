# 1) Бекенд і ключ
if (-not $env:MEDUSA_BACKEND_URL) { $env:MEDUSA_BACKEND_URL = $env:VITE_BACKEND_URL }
if (-not $env:MEDUSA_BACKEND_URL) { throw "MEDUSA_BACKEND_URL is empty. Load .env into this PowerShell session." }
if (-not $env:MEDUSA_SECRET_API_KEY) { throw "MEDUSA_SECRET_API_KEY is empty. Load .env into this PowerShell session." }

$base = $env:MEDUSA_BACKEND_URL.TrimEnd("/")
$headers = @{ Authorization = "Basic $env:MEDUSA_SECRET_API_KEY" }

# 2) Налаштування
$limit = 100
$offset = 0

# Дефолт: всім ставимо in_stock
$defaultAvailability = "in_stock"

# Винятки: список handle, які мають бути made_to_order
# (заповниш сам)
$madeToOrderHandles = @(
  # "manzhety-zhorki-posyleni",
  # "sandal-dlya-stopy-reabilitatsiynyy"
)

# 3) Функція апдейту
function Set-Availability([string]$prodId, [string]$availability) {
  $body = @{ metadata = @{ availability = $availability } } | ConvertTo-Json -Depth 10
  Invoke-RestMethod -Method Post `
    -Uri "$base/admin/products/$prodId" `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body | Out-Null
}

# 4) Цикл по всіх продуктах
while ($true) {
  $url = "$base/admin/products?limit=$limit&offset=$offset"
  $resp = Invoke-RestMethod -Method Get -Uri $url -Headers $headers

  $products = @($resp.products)
  if ($products.Count -eq 0) { break }

  foreach ($p in $products) {
    $handle = $p.handle
    $meta = $p.metadata

    $current = $null
    if ($meta -and $meta.PSObject.Properties.Name -contains "availability") {
      $current = $meta.availability
    }

    # якщо вже задано — не чіпаємо
    if ($current) { continue }

    $target = $defaultAvailability
    if ($madeToOrderHandles -contains $handle) { $target = "made_to_order" }

    try {
      Set-Availability -prodId $p.id -availability $target
      Write-Host "OK: $handle -> $target"
      Start-Sleep -Milliseconds 120
    } catch {
      Write-Host "FAIL: $handle ($($p.id)) -> $target"
      Write-Host $_
    }
  }

  $offset += $limit
}
