
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$sourcePath,
        [string]$targetPath,
        [int]$width,
        [int]$height
    )
    $sourceImg = [System.Drawing.Image]::FromFile($sourcePath)
    $targetImg = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($targetImg)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($sourceImg, 0, 0, $width, $height)
    
    $targetImg.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $targetImg.Dispose()
    $sourceImg.Dispose()
}

$baseRes = "e:\AI Building\WorkShop\lawsuit app\android\app\src\main\res"
$source = "e:\AI Building\WorkShop\lawsuit app\h.png"

# Densities and sizes (Legacy: 48, 72, 96, 144, 192 | Adaptive Foreground: 108, 162, 216, 324, 432)
$configs = @(
    @{ name="mdpi"; legacy=48; foreground=108 },
    @{ name="hdpi"; legacy=72; foreground=162 },
    @{ name="xhdpi"; legacy=96; foreground=216 },
    @{ name="xxhdpi"; legacy=144; foreground=324 },
    @{ name="xxxhdpi"; legacy=192; foreground=432 }
)

foreach ($c in $configs) {
    $dir = Join-Path $baseRes ("mipmap-" + $c.name)
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir }
    
    # Legacy Square Icon
    Resize-Image $source (Join-Path $dir "ic_launcher.png") $c.legacy $c.legacy
    # Legacy Round Icon
    Resize-Image $source (Join-Path $dir "ic_launcher_round.png") $c.legacy $c.legacy
    # Adaptive Foreground (Centered)
    Resize-Image $source (Join-Path $dir "ic_launcher_foreground.png") $c.foreground $c.foreground
}

# Splash Screen Generation
$splashDir = Join-Path $baseRes "drawable"
if (-not (Test-Path $splashDir)) { New-Item -ItemType Directory -Path $splashDir }
# Using xxxhdpi size for base splash (around 512 is safe)
Resize-Image $source (Join-Path $splashDir "splash.png") 512 512

Write-Host "All production assets generated from h.png."
